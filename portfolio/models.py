from django.db import models
from django.contrib.auth.models import User
class portfolio(models.Model):
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    phone = models.IntegerField(null=True)
    joined_date = models.DateField(null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE) 
   
    

    def __str__(self):
        return f"{self.firstname} {self.lastname} {self.username}"


# Create your models here.
