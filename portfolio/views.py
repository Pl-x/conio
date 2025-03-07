import requests
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import portfolio
from django.http import JsonResponse
from .forms import ContactForm
from django.views.decorators.csrf import csrf_exempt

def portfolio_view(request):
    myport = portfolio.objects.all().values()
    context = {
        'myport': myport,
    }
    return render(request, 'data.html', context)
def prac(request):
    return render(request, 'home.html')
def signin(request):
     if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)  # Log the user in
            messages.success(request, 'Logged in successfully!')
            return redirect('home')  # Redirect to profile page after login
        else:
            messages.error(request, 'Invalid credentials')
            return render(request, 'signin.html')
     return render(request, 'signin.html')

def home(request):
    return render(request, 'home.html')

def me(request):
    return render(request, 'me.html')

def portfolio(request):
    return render(request, 'portfolio.html')    
def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        # Ensure the password and confirm password match (optional)
        password2 = request.POST['password2']
        if password != password2:
            messages.error(request, 'Passwords do not match')
            return render(request, 'signup.html')

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken')
            return render(request, 'signup.html')
        
        # Create user and redirect to login page
        User.objects.create_user(username=username, email=email, password=password)
        messages.success(request, 'Account created successfully. Please log in.')
        return redirect('signin')
    return render(request, 'signup.html')
def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)  # Log the user in
            messages.success(request, 'Logged in successfully!')
            next_page = request.GET.get('next', 'home')
            return redirect('home')  # Redirect to profile page after login
        else:
            messages.error(request, 'Invalid credentials')
            return render(request, 'signin.html')
    return render(request, 'signin.html')   
@login_required
def profile(request):
    user = request.user  # Get the logged-in user
    return render(request, 'home.html', {'user': user}) 
@login_required
def user_logout(request):
    logout(request)
    return redirect('signin')

@csrf_exempt
def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            message = form.cleaned_data['message']

            # Send the data to Node.js service for email sending
            payload = {
                'name': name,
                'email': email,
                'message': message
            }

            # URL of the Node.js email service
            node_email_service_url = 'http://localhost:3000/send-email'

            try:
                response = requests.post(node_email_service_url, json=payload)
                if response.status_code == 200:
                    return JsonResponse({'success': True, 'message': 'Message sent successfully!'})
                else:
                    return JsonResponse({'success': False, 'message': 'Failed to send email from Node.js service.'})
            except requests.exceptions.RequestException as e:
                return JsonResponse({'success': False, 'message': f'Error connecting to email service: {str(e)}'})

    else:
        form = ContactForm()

    return render(request, 'me.html', {'form': form})    
