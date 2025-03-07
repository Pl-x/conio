from django.urls import path
from . import views
urlpatterns = [
    path('portfolio/', views.portfolio_view, name='portfolio'),
    path('home/', views.home, name='home'),
    path('home/me/', views.me, name='me'),
    path('signin/', views.signin, name='signin'),
    path('prac/', views.prac, name='prac'),
    path('signin/direct', views.home, name='direct'),
    path('signin/back', views.signin, name='back'),
    path('signup', views.signup, name='signup'),
    path('signin/', views.user_login, name='user_login'),
    path('home/back', views.user_logout, name='user_logout'),
    path('send-email/', views.contact_view, name='send_email'),
    # path('home/me/send-email/', views.contact_view, name='send_email'),
    # path('signin/portfolio', views.port, name='port'),
    # path('contacts/', views.contacts, name='contacts'),
    # path('projects/', views.projects, name='projects'),
    # bsyp prsu ipko licq
]