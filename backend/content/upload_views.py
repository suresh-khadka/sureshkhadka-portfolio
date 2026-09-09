from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .permissions import IsAdminOrReadOnly
from .utils import upload_file_to_supabase
import uuid
import os

class FileUploadView(APIView):
    """
    Endpoint to upload images to Supabase Storage.
    Only accessible by the Admin.
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminOrReadOnly]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            blog_id = request.query_params.get('blog_id')
            upload_type = request.query_params.get('type')
            custom_path = None

            if upload_type == 'cover' and blog_id:
                file_extension = os.path.splitext(file_obj.name)[1]
                custom_path = f"blogs/{blog_id}/cover/{uuid.uuid4()}{file_extension}"

            # upload_file_to_supabase returns (public_url, file_path)
            public_url, _ = upload_file_to_supabase(file_obj, custom_path=custom_path)
            return Response({'url': public_url}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
