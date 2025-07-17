from rest_framework import serializers
from .models import Attendance
from farmers.models import Block, Section
from farmers.serializers import FarmerSerializer


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ['id', 'name']


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'name']


class AttendanceSerializer(serializers.ModelSerializer):
    farmer_details = FarmerSerializer(source='farmer', read_only=True)
    block_details = BlockSerializer(source='block', read_only=True)
    section_details = SectionSerializer(source='section', read_only=True)
    recorded_by = serializers.StringRelatedField(read_only=True)

    # Writeable fields for POST/PATCH
    block = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all(), required=False, allow_null=True
    )
    section = serializers.PrimaryKeyRelatedField(
        queryset=Section.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Attendance
        fields = [
            'id', 'farmer', 'farmer_details',
            'block', 'block_details',
            'section', 'section_details',
            'date', 'time', 'attendance_type', 'status',
            'recorded_by', 'comment', 'penalty_points',
            'evidence', 'duration_minutes'
        ]
        extra_kwargs = {
            'recorded_by': {'read_only': True},
        }

    def validate(self, data):
        if data.get("attendance_type") == "block_canal_cleaning":
            if not data.get("block") or not data.get("section"):
                raise serializers.ValidationError("Block and section are required for block canal cleaning.")
        return data
