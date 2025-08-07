-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.get_user_email() = 'admin@lovable.com');

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.get_user_email() = 'admin@lovable.com');

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.get_user_email() = 'admin@lovable.com');

-- Create function to get user email
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role);
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.is_admin(auth.uid());
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Insert admin role for admin@lovable.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@lovable.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert user role for teste@lovable.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role 
FROM auth.users 
WHERE email = 'teste@lovable.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies for pagamentos
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.pagamentos;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.pagamentos;

-- Only admins can delete payments
CREATE POLICY "Only admins can delete payments" 
ON public.pagamentos 
FOR DELETE 
USING (public.current_user_is_admin());

-- Only admins can update payments
CREATE POLICY "Only admins can update payments" 
ON public.pagamentos 
FOR UPDATE 
USING (public.current_user_is_admin());

-- All authenticated users can view payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.pagamentos;
CREATE POLICY "All users can view payments" 
ON public.pagamentos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- All authenticated users can create payments
DROP POLICY IF EXISTS "Users can create their own payments" ON public.pagamentos;
CREATE POLICY "All users can create payments" 
ON public.pagamentos 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update RLS policies for clientes - all authenticated users can do everything
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clientes;

CREATE POLICY "All users can view clients" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All users can create clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "All users can update clients" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All users can delete clients" 
ON public.clientes 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update RLS policies for ordens_servico - all authenticated users can do everything
DROP POLICY IF EXISTS "Users can view their own orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.ordens_servico;

CREATE POLICY "All users can view orders" 
ON public.ordens_servico 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All users can create orders" 
ON public.ordens_servico 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "All users can update orders" 
ON public.ordens_servico 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All users can delete orders" 
ON public.ordens_servico 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update RLS policies for profiles - all users can view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "All users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);