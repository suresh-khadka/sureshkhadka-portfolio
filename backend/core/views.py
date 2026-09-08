from django.http import JsonResponse

def health_check(request):
    """
    Simple health check endpoint for Render.
    """
    return JsonResponse({"status": "healthy", "version": "1.0.0"}, status=200)
