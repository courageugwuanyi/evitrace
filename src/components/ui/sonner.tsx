import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast relative group-[.toaster]:bg-white group-[.toaster]:text-[#172B4D] group-[.toaster]:border-[#DFE1E6] group-[.toaster]:rounded-md group-[.toaster]:shadow-sm group-[.toaster]:px-3 group-[.toaster]:py-2 group-[.toaster]:text-sm",
          description: "group-[.toast]:text-[#42526E] group-[.toast]:text-xs",
          title: "group-[.toast]:font-semibold",
          success:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#36B37E]",
          error:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#DE350B]",
          warning:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#FFAB00]",
          info:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#0052CC]",
          actionButton:
            "group-[.toast]:bg-[#0052CC] group-[.toast]:text-white group-[.toast]:h-7 group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-[#F4F5F7] group-[.toast]:text-[#42526E] group-[.toast]:h-7 group-[.toast]:text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
