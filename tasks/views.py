from django.db import IntegrityError
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from rest_framework import viewsets
from django.contrib.auth import authenticate, login, logout

from tasks.models import Project, User, Task, Comment
from .serializers import (
    UserSerializer, ProjectSerializer,
    TaskSerializer, CommentSerializer
)

# Create your views here.

def index(request):
    return render(request, 'tasks/index.html')


def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("index")
        else:
            return render(request, "tasks/login.html", {
                "message": "Invalid username or password."
            })
        
    return render(request, "tasks/login.html")


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "tasks/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "tasks/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "tasks/register.html")


def logout_view(request):
    logout(request)
    return redirect("login")


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(creator=user) | Q(users=user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.creator != request.user:
            return Response({"detail": "You do not have permission to delete this project."}, status=403)
        return super().destroy(request, *args, **kwargs)

        
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(user=user) |
            Q(task_users=user) |
            Q(project__users=user)
        ).distinct()
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"detail": "You do not have permission to delete this task."}, status=403)
        return super().destroy(request, *args, **kwargs)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

