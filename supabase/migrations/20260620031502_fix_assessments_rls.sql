-- Drop existing restrictive insert policies if they are misconfigured
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.assessments;
DROP POLICY IF EXISTS "Users can create assessments" ON public.assessments;

-- Create a clean, strict policy allowing users to write their own records
CREATE POLICY "Allow authenticated users to insert assessments" 
ON public.assessments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Ensure users can read back their historical assessment reports
CREATE POLICY "Allow authenticated users to view own assessments" 
ON public.assessments 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);