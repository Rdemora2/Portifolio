from django.urls import path
from .views import ProjectsList, ProjectDetail

urlpatterns = [
    path('projects/', ProjectsList.as_view(), name='projects-list'),
    path('projects/<int:pk>/', ProjectDetail.as_view(), name='project-detail'),
]