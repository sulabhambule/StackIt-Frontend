import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        // Define styles for different variants
        let toastClasses = "border p-4 rounded shadow-md ";

        switch (variant) {
          case "success":
            toastClasses += "bg-green-50 border-green-400 text-green-900";
            break;
          case "destructive":
            toastClasses += "bg-red-50 border-red-400 text-red-900";
            break;
          case "warning":
            toastClasses += "bg-yellow-50 border-yellow-400 text-yellow-900";
            break;
          default:
            toastClasses += "bg-white border-gray-200 text-gray-900";
            break;
        }

        return (
          <Toast key={id} {...props} className={toastClasses}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-4 right-4 z-50" />
    </ToastProvider>
  );
}
