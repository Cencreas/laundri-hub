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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOrdemServico, OrdemServicoWithCliente } from "@/hooks/useOrdemServico";

const formSchema = z.object({
  status: z.string().min(1, "Status é obrigatório"),
  observacoes: z.string().optional(),
});

interface EditarStatusDialogProps {
  ordem: OrdemServicoWithCliente;
  children?: React.ReactNode;
}

export function EditarStatusDialog({ ordem, children }: EditarStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateOrdem } = useOrdemServico();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: ordem.status,
      observacoes: ordem.observacoes || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('📝 Atualizando status da ordem:', ordem.id, values);
      await updateOrdem(ordem.id, {
        status: values.status,
        observacoes: values.observacoes,
      });
      setOpen(false);
      console.log('✅ Status atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  };

  const statusOptions = [
    { value: "recebido", label: "Recebido" },
    { value: "em_processo", label: "Em Processo" },
    { value: "pronto", label: "Pronto" },
    { value: "entregue", label: "Entregue" },
    { value: "cancelado", label: "Cancelado" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Status da Ordem</DialogTitle>
          <DialogDescription>
            Atualize o status da ordem {ordem.id} - {ordem.clientes.nome}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
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
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione observações sobre a mudança de status" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}