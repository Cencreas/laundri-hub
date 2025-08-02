-- Create enums for type safety
CREATE TYPE public.tipo_servico AS ENUM (
  'lavagem_simples',
  'lavagem_seco', 
  'engomagem',
  'lavagem_engomagem',
  'lavagem_especial'
);

CREATE TYPE public.status_ordem AS ENUM (
  'recebido',
  'em_processo',
  'pronto',
  'entregue',
  'cancelado'
);

CREATE TYPE public.forma_pagamento AS ENUM (
  'dinheiro',
  'm_pesa',
  'transferencia',
  'cartao'
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  contacto TEXT NOT NULL,
  endereco TEXT NOT NULL,
  documento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ordens_servico table
CREATE TABLE public.ordens_servico (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_roupa TEXT NOT NULL,
  tipo_servico tipo_servico NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario > 0),
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  data_entrega_prevista DATE NOT NULL,
  status status_ordem NOT NULL DEFAULT 'recebido',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pagamentos table
CREATE TABLE public.pagamentos (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ordem_id TEXT NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10,2) NOT NULL CHECK (valor_pago > 0),
  forma_pagamento forma_pagamento NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for clientes
CREATE POLICY "Users can view their own clients" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON public.clientes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for ordens_servico
CREATE POLICY "Users can view their own orders" 
ON public.ordens_servico 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.ordens_servico 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.ordens_servico 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" 
ON public.ordens_servico 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for pagamentos
CREATE POLICY "Users can view their own payments" 
ON public.pagamentos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.pagamentos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
ON public.pagamentos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" 
ON public.pagamentos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();