"""
User authentication URL routes.
"""

from django.urls import path

from . import views

app_name = 'users'

urlpatterns = [
    # SSO Authentication
    path('auth/sso/', views.sso_authenticate, name='sso_authenticate'),

    # Current user endpoints
    path('me/', views.get_current_user, name='get_current_user'),
    path('me/update/', views.update_current_user, name='update_current_user'),

    # Logout
    path('auth/logout/', views.logout, name='logout'),
]
