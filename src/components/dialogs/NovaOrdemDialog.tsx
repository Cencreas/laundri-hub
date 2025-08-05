import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOrdemServico } from "@/hooks/useOrdemServico";
import { useClientes } from "@/hooks/useClientes";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  tipo_servico: z.string().min(1, "Selecione o tipo de serviço"),
  tipo_roupa: z.string().min(2, "Tipo de roupa é obrigatório"),
  quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1"),
  preco_unitario: z.number().min(0.01, "Preço deve ser maior que 0"),
  data_entrega_prevista: z.string().min(1, "Data de entrega é obrigatória"),
  observacoes: z.string().optional(),
});

export function NovaOrdemDialog() {
  const [open, setOpen] = useState(false);
  const { createOrdem } = useOrdemServico();
  const { clientes } = useClientes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
      tipo_servico: "",
      tipo_roupa: "",
      quantidade: 1,
      preco_unitario: 0,
      data_entrega_prevista: "",
      observacoes: "",
    },
  });

  const watchQuantidade = form.watch("quantidade");
  const watchPrecoUnitario = form.watch("preco_unitario");
  const total = watchQuantidade * watchPrecoUnitario;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const ordemData = {
        cliente_id: values.cliente_id,
        tipo_servico: values.tipo_servico,
        tipo_roupa: values.tipo_roupa,
        quantidade: values.quantidade,
        preco_unitario: values.preco_unitario,
        total,
        data_entrega_prevista: values.data_entrega_prevista,
        status: "recebido",
        observacoes: values.observacoes,
      };
      console.log('📝 Submetendo formulário de nova ordem:', ordemData);
      await createOrdem(ordemData);
      form.reset();
      setOpen(false);
      console.log('✅ Ordem criada e dialog fechado');
    } catch (error) {
      console.error('❌ Erro ao criar ordem no formulário:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Crie uma nova ordem de serviço para um cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome} - {cliente.contacto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tipo_servico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lavagem_simples">Lavagem Simples</SelectItem>
                      <SelectItem value="lavagem_seco">Lavagem a Seco</SelectItem>
                      <SelectItem value="engomagem">Engomagem</SelectItem>
                      <SelectItem value="lavagem_engomagem">Lavagem + Engomagem</SelectItem>
                      <SelectItem value="lavagem_especial">Lavagem Especial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_roupa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Roupa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camisa, Calça, Vestido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (MT)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Total: {total.toFixed(2)} MT</p>
            </div>

            <FormField
              control={form.control}
              name="data_entrega_prevista"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Entrega Prevista</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações sobre a ordem" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Criando..." : "Criar Ordem"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}