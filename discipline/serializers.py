from rest_framework import serializers
from django.contrib.auth import get_user_model
from farmers.models import Farmer
from .models import DisciplineCase

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    """Lightweight user representation."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
        read_only_fields = fields

class FarmerSimpleSerializer(serializers.ModelSerializer):
    """Minimal farmer info for display."""
    class Meta:
        model = Farmer
        fields = ['id', 'first_name', 'last_name', 'registration_number']
        read_only_fields = fields

class DisciplineCaseSerializer(serializers.ModelSerializer):
    # Read‐only nested representations
    farmer = FarmerSimpleSerializer(read_only=True)
    block = serializers.StringRelatedField(read_only=True)
    section = serializers.StringRelatedField(read_only=True)
    reported_by = SimpleUserSerializer(read_only=True)
    resolved_by = SimpleUserSerializer(read_only=True)

    # Write‐only PK fields
    farmer_id = serializers.PrimaryKeyRelatedField(
        queryset=Farmer.objects.all(),
        source='farmer',
        write_only=True
    )
    reported_by_id = serializers.HiddenField(
        default=serializers.CurrentUserDefault(),
        source='reported_by'
    )

    class Meta:
        model = DisciplineCase
        fields = [
            'id',
            'farmer',      'farmer_id',
            'block',       'section',
            'date_reported','date_incident',
            'offence_type','offence_description',
            'action_taken','status','severity',
            'penalty_points','comment',
            'reported_by','reported_by_id',
            'resolved_by','resolution_date',
            'attachment','evidence',
        ]
        read_only_fields = [
            'id', 'date_reported', 'block', 'section',
            'reported_by', 'resolved_by', 'resolution_date'
        ]

    def validate(self, data):
        # Ensure action_taken is provided when resolving
        if data.get('status') == 'resolved' and not data.get('action_taken'):
            raise serializers.ValidationError({
                'action_taken': 'This field is required when resolving a case.'
            })
        return data

    def create(self, validated_data):
        # Auto‐assign block and section based on chosen farmer
        farmer = validated_data['farmer']
        validated_data['block'] = farmer.block
        validated_data['section'] = farmer.section
        return super().create(validated_data)
