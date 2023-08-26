from django.urls import path
from .views import ProjectsList, ProjectDetail, ImageURLsView


urlpatterns = [
    path('projects/', ProjectsList.as_view(), name='projects-list'),
    path('projects/<int:pk>/', ProjectDetail.as_view(), name='project-detail'),
    path('image-urls/', ImageURLsView.as_view(), name='image-urls')
]