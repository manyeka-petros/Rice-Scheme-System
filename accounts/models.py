from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('block_chair', 'Block Chair'),
        ('president', 'President'),
        ('admin', 'Admin'),
        ('treasurer', 'Treasurer'),
        ('secretary', 'Secretary'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    is_approved = models.BooleanField(default=False)  # Track admin approval

    block = models.ForeignKey(  # For block chairs
        'farmers.Block', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='users'
    )

    section = models.ForeignKey(  # New field for finer access control
        'farmers.Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    class Meta:
        permissions = [
            ('can_approve_users', 'Can approve new user registrations'),
            ('can_assign_roles', 'Can assign roles to users'),
        ]
