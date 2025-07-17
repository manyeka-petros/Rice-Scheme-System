from django.db import models
from django.core.validators import MinValueValidator, RegexValidator, FileExtensionValidator
from django.core.exceptions import ValidationError
from django.db.models import Max
import logging

logger = logging.getLogger(__name__)

# -------------------
# Location Model
# -------------------
class Location(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# -------------------
# Block Model
# -------------------
class Block(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# -------------------
# Section Model
# -------------------
class Section(models.Model):
    name = models.CharField(max_length=50)
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name="sections")

    class Meta:
        unique_together = ("name", "block")

    def __str__(self):
        return f"{self.block.name} - {self.name}"


# -------------------
# Farmer Model
# -------------------
class Farmer(models.Model):
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('chairperson', 'Block Chairperson'),
        ('president', 'President'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    # Personal Info
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    # Contact Info
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'."
    )
    phone_number = models.CharField(
        max_length=17,
        validators=[phone_regex],
        unique=True
    )
    email = models.EmailField(blank=True, null=True)

    # Farm Info
    registration_number = models.CharField(max_length=20, unique=True, blank=True)
    number_of_plots = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    amount_per_plot = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Location & Assignment
    location = models.ForeignKey(Location, on_delete=models.PROTECT)
    block = models.ForeignKey(Block, on_delete=models.PROTECT)
    section = models.ForeignKey(Section, on_delete=models.PROTECT)

    # Extra Info
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="farmer")
    next_of_kin = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(
        upload_to="farmer_photos/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"])]
    )

    # Metadata
    is_active = models.BooleanField(default=True)
    date_registered = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_registered']
        permissions = [
            ("can_approve_farmers", "Can approve farmer registrations"),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.registration_number})"

    def clean(self):
        # Validate section belongs to the selected block
        if self.section.block != self.block:
            raise ValidationError("Selected section does not belong to the selected block.")

        # Ensure only one chairperson per block
        if self.role == "chairperson":
            exists = Farmer.objects.filter(
                block=self.block,
                role="chairperson",
                is_active=True
            ).exclude(pk=self.pk).exists()
            if exists:
                raise ValidationError("This block already has a chairperson.")

    def save(self, *args, **kwargs):
        if not self.registration_number:
            max_id = Farmer.objects.aggregate(max_id=Max('id'))['max_id'] or 0
            self.registration_number = f"LRS{(max_id + 1):05d}"
        
        self.total_amount = self.number_of_plots * self.amount_per_plot
        super().save(*args, **kwargs)

    def delete(self):
        self.is_active = False
        self.save()
