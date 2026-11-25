import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null | undefined;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: false;
}

interface InteractiveStarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive: true;
  onChange: (rating: number) => void;
}

type Props = StarRatingProps | InteractiveStarRatingProps;

const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

export function StarRating({ value, max = 5, size = 'md', ...rest }: Props) {
  const interactive = 'interactive' in rest && rest.interactive;
  const onChange = interactive ? (rest as InteractiveStarRatingProps).onChange : undefined;
  const iconClass = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = value != null && i < value;
        return interactive ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            className="focus:outline-none"
          >
            <Star
              className={`${iconClass} transition-colors ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
            />
          </button>
        ) : (
          <Star
            key={i}
            className={`${iconClass} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        );
      })}
    </div>
  );
}
