import os
from supabase import create_client, Client


class SupabaseClient:
    def __init__(self):
        self.url: str = os.getenv("SUPABASE_URL")
        self.key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được set")

        self.client: Client = create_client(self.url, self.key)

    def get_client(self) -> Client:
        return self.client
