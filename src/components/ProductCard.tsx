import { Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  reference: string;
  thumbnailUrl?: string | null;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ProductCard = ({
  id,
  name,
  reference,
  thumbnailUrl,
  isSelected,
  onToggle,
}: ProductCardProps) => {
  // Format CN: remove the dot if present
  const formattedCN = reference?.replace(".", "") || "";

  return (
    <button
      onClick={() => onToggle(id)}
      className={cn(
        "relative flex flex-col items-center p-3 rounded-lg bg-white border-2 transition-all duration-200 hover:shadow-md group min-h-[140px]",
        isSelected
          ? "border-secondary ring-2 ring-secondary/30 shadow-md"
          : "border-transparent hover:border-muted-foreground/20"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Product image */}
      <div className="flex-1 flex items-center justify-center w-full mb-2">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-16 h-16 object-contain group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Product name */}
      <p className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2 mb-1">
        {name}
      </p>

      {/* CN code */}
      <p className="text-[10px] text-muted-foreground">
        C.N. {formattedCN}
      </p>
    </button>
  );
};
