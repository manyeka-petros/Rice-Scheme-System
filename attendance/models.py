from django.db import models
from farmers.models import Farmer, Block, Section
from django.contrib.auth import get_user_model

User = get_user_model()

class Attendance(models.Model):
    ATTENDANCE_TYPES = [
        ("general_assembly", "General Assembly"),
        ("main_canal_cleaning", "Main Canal Cleaning"),
        ("block_canal_cleaning", "Block Canal Cleaning"),
        ("training", "Training Session"),
        ("field_inspection", "Field Inspection"),
    ]

    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("excused", "Excused (With Reason)"),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='attendances')
    
    # ✅ Make block and section optional to avoid IntegrityError
    block = models.ForeignKey(Block, on_delete=models.SET_NULL, null=True, blank=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True)
    
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    attendance_type = models.CharField(max_length=50, choices=ATTENDANCE_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    recorded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        limit_choices_to={'role__in': ['block_chair', 'admin']}
    )

    comment = models.TextField(blank=True, null=True)
    penalty_points = models.IntegerField(default=0)
    evidence = models.ImageField(upload_to='attendance_evidence/', blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(default=0, help_text="Duration of attendance in minutes")

    class Meta:
        unique_together = ['farmer', 'date', 'attendance_type']
        verbose_name_plural = "Attendance Records"

    def __str__(self):
        return f"{self.farmer} - {self.date} - {self.get_attendance_type_display()}"
