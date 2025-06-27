from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

# User Model
class User(AbstractUser):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.username}"

   
# Project model
class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    users = models.ManyToManyField('User', related_name='projects')
    status = models.CharField(max_length=20, choices=[
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In progress'),
        ('CLOSED', 'Closed')
    ],
    default='OPEN'
    )
    creation_date = models.DateTimeField(auto_now_add=True)
    objective_date = models.DateTimeField(null=True, blank=True)
    closed_date = models.DateTimeField(null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects', null=True)
    

    def __str__(self):
        return self.title

# Task Model
class Task(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='created_tasks')
    title = models.CharField(max_length=200)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    description = models.TextField(blank=True)
    task_users = models.ManyToManyField('User', related_name='assigned_tasks', blank=True)
    tags = models.ManyToManyField('Tag', blank=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    objective_date = models.DateTimeField(null=True, blank=True)
    closed_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=[
            ('OPEN', 'Open'),
            ('IN_PROGRESS', 'In progress'),
            ('CLOSED', 'Closed')
        ],
        default='OPEN'
    )

    def __str__(self):
        return self.title





# Comment model
class Comment(models.Model):
    author = models.ForeignKey('User', on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    content = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

# Tag task Model
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
