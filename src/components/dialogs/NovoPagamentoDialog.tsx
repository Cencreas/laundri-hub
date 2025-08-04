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
import { usePagamentos } from "@/hooks/usePagamentos";
import { useOrdemServico } from "@/hooks/useOrdemServico";

const formSchema = z.object({
  ordem_id: z.string().min(1, "Selecione uma ordem"),
  valor_pago: z.number().min(0.01, "Valor deve ser maior que 0"),
  forma_pagamento: z.string().min(1, "Selecione a forma de pagamento"),
  data_pagamento: z.string().min(1, "Data de pagamento é obrigatória"),
  observacoes: z.string().optional(),
});

interface NovoPagamentoDialogProps {
  ordemId?: string;
  children?: React.ReactNode;
}

export function NovoPagamentoDialog({ ordemId, children }: NovoPagamentoDialogProps) {
  const [open, setOpen] = useState(false);
  const { createPagamento } = usePagamentos();
  const { ordens } = useOrdemServico();

  // Filtrar apenas ordens que não foram pagas ainda
  const { pagamentos } = usePagamentos();
  const ordensNaoPagas = ordens.filter(ordem => 
    !pagamentos.some(pagamento => pagamento.ordem_id === ordem.id)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ordem_id: ordemId || "",
      valor_pago: 0,
      forma_pagamento: "",
      data_pagamento: new Date().toISOString().split('T')[0],
      observacoes: "",
    },
  });

  const watchOrdemId = form.watch("ordem_id");
  const ordemSelecionada = ordens.find(ordem => ordem.id === watchOrdemId);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createPagamento({
        ordem_id: values.ordem_id,
        valor_pago: values.valor_pago,
        forma_pagamento: values.forma_pagamento,
        data_pagamento: values.data_pagamento,
        observacoes: values.observacoes,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Pagamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Registre um pagamento para uma ordem de serviço.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ordem_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ordem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ordensNaoPagas.map((ordem) => (
                        <SelectItem key={ordem.id} value={ordem.id}>
                          {ordem.id} - {ordem.clientes.nome} - {ordem.total} MT
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {ordemSelecionada && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm"><strong>Cliente:</strong> {ordemSelecionada.clientes.nome}</p>
                <p className="text-sm"><strong>Tipo:</strong> {ordemSelecionada.tipo_roupa}</p>
                <p className="text-sm"><strong>Quantidade:</strong> {ordemSelecionada.quantidade}</p>
                <p className="text-sm"><strong>Total:</strong> {ordemSelecionada.total} MT</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="valor_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Pago (MT)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="m_pesa">M-Pesa</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento</FormLabel>
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
                    <Textarea placeholder="Observações sobre o pagamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Registrando..." : "Registrar Pagamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}