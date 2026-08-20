CREATE TABLE IF NOT EXISTS public.project_editor_state (
    project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.project_editor_state ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own project editor state
DROP POLICY IF EXISTS "Users can manage their own project editor state" ON public.project_editor_state;
CREATE POLICY "Users can manage their own project editor state" 
ON public.project_editor_state 
FOR ALL 
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
);
