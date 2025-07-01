from django.contrib import admin
from tasks.models import User, Project, Task, Comment
# Register your models here.

admin.site.register(Project)
admin.site.register(Comment)
admin.site.register(User)
admin.site.register(Task)

