"""
Onboarding URL routes.
"""

from django.urls import path

from . import views

app_name = 'onboarding'

urlpatterns = [
    path('complete/', views.complete_onboarding, name='complete_onboarding'),
]
