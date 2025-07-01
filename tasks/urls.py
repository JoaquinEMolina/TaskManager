from django.db import router
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    UserViewSet, ProjectViewSet,
    TaskViewSet, CommentViewSet
)


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet)


urlpatterns = [
    path('', views.index, name="index"), # <- index View
    path('api/', include(router.urls)), # <- API Endpoints
    path("login", views.login_view, name="login"), # <- Login Form
    path("logout", views.logout_view, name="logout"), # <- Logout Form
    path("register", views.register, name="register") # <- Register Form

]
