"""
Lesson URL routes.
"""

from django.urls import path

from . import views

app_name = 'lessons'

urlpatterns = [
    # Scenarios
    path('scenarios/', views.scenario_list, name='scenario_list'),

    # Lessons
    path('lessons/', views.lesson_list, name='lesson_list'),
    path('lessons/<int:lesson_id>/', views.lesson_detail, name='lesson_detail'),
    path('lessons/<int:lesson_id>/attempts/', views.lesson_attempts, name='lesson_attempts'),

    # Today's plan
    path('plan/today/', views.today_plan, name='today_plan'),
]
