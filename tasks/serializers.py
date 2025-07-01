# serializers.py
from tokenize import Comment
from rest_framework import serializers
from .models import User, Task, Project, Comment


# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'surname']
    
    def validate_username(self,value):
        if "puto" in value:
            raise serializers.ValidationError("como le vas a poner asi negro")
        return value


# Comment Serializer
class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Comment
        fields = ['id', 'author_username', 'task', 'project', 'content', 'creation_date']

# Task Serializer
class TaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # To Write
    task_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), write_only=True
    )
    # To read
    task_users_data = UserSerializer(source='task_users', many=True, read_only=True)

    comments = CommentSerializer(read_only=True, many=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_users_data = serializers.SerializerMethodField()

    def get_project_users_data(self, obj):
        if obj.project:
            return [{'id': u.id, 'username': u.username} for u in obj.project.users.all()]
        return []
    

    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'project', 'description',
                  'task_users', 'task_users_data', 'comments', 'project_title', 'creation_date',
                  'objective_date', 'closed_date', 'status', 'project_users_data']

class ProjectSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, write_only=True)  # To whrite
    users_data = UserSerializer(source='users', many=True, read_only=True)  # To read

    tasks = TaskSerializer(read_only=True, many=True)
    comments = CommentSerializer(read_only=True, many=True)
    creator = serializers.StringRelatedField()


    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'users', 'users_data',
            'status', 'creation_date', 'creator',
            'objective_date', 'closed_date', 'tasks', 'comments'
        ]
    






        