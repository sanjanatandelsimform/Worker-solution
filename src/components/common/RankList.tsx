import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Label } from "@/components/base/input/label";

interface RankingItemProps {
  id: string;
  label: string;
}

function RankingItem({ id, label }: RankingItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 bg-white px-4 py-3 cursor-move hover:bg-gray-50 transition-colors"
    >
      <div className="flex flex-col gap-0.5">
        <div className="h-0.5 w-4 bg-gray-400" />
        <div className="h-0.5 w-4 bg-gray-400" />
      </div>
      <span className="flex-1 text-base font-normal text-gray-900">{label}</span>
    </div>
  );
}

interface RankingListProps {
  label: string;
  isRequired: boolean;
  displayOrder: number;
  availableOptions: Array<{ label: string; value: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  maxItems?: number;
}

export function RankingList({
  label,
  isRequired,
  displayOrder,
  availableOptions,
  value,
  onChange,
  error,
  maxItems = 3,
}: RankingListProps) {
  const [items, setItems] = useState<Array<{ id: string; label: string }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when availableOptions changes (real-time on each selection)
  useEffect(() => {
    // Build items from availableOptions (selected goals from Question 1)
    const newItems = availableOptions
      .slice(0, maxItems)
      .map(opt => ({
        id: opt.value,
        label: opt.label,
      }));

    setItems(newItems);

    // Auto-update parent with new order if items changed
    const newValues = newItems.map(item => item.id);
    if (JSON.stringify(newValues) !== JSON.stringify(value)) {
      onChange(newValues);
    }
  }, [availableOptions.map(opt => opt.value).join(','), maxItems]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update parent component with new order
        onChange(newItems.map(item => item.id));
        return newItems;
      });
    }
  }

  // Show empty state only when NO goals are selected
  if (items.length === 0) {
    return (
      <div className="flex w-full flex-col gap-2">
        <Label isRequired={isRequired} className="text-base">
          {displayOrder}. {label}
        </Label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Select at least {maxItems} goals from the list above to rank them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Label isRequired={isRequired} className="text-base">
        {displayOrder}. {label}
      </Label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <RankingItem key={item.id} id={item.id} label={item.label} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}