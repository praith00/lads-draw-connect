-- Allow null room_id for custom conversations
ALTER TABLE public.conversations ALTER COLUMN room_id DROP NOT NULL;