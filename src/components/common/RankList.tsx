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

  // Update items when availableOptions changes, but preserve user reordering
  useEffect(() => {
    // Build items from ALL availableOptions (all selected goals from Question 1)
    // We show every selected goal in the ranking list,
    // but only the first `maxItems` are treated as the actual ranked/top goals.
    const expectedItems = availableOptions.map(opt => ({
      id: opt.value,
      label: opt.label,
    }));

    // Get current item IDs
    const currentItemIds = items.map(item => item.id);
    const expectedItemIds = expectedItems.map(item => item.id);

    // If we have a value prop (existing ranking), use it to initialize order
    // Otherwise, use the order from availableOptions
    let initialOrder: string[] = [];
    if (value && value.length > 0 && Array.isArray(value)) {
      // Use existing ranking order, but ensure all selected goals are included
      const rankedIds = value.slice(0, maxItems); // Top ranked goals
      const unrankedIds = expectedItemIds.filter(id => !rankedIds.includes(id));
      initialOrder = [...rankedIds, ...unrankedIds];
    } else {
      initialOrder = expectedItemIds;
    }

    // Only update if:
    // 1. Items are missing (new selections added)
    // 2. Items are different (selections changed)
    // BUT preserve order if all items exist (user might have reordered)
    const itemsChanged =
      JSON.stringify([...currentItemIds].sort()) !== JSON.stringify([...expectedItemIds].sort());
    const hasMissingItems = expectedItemIds.some(id => !currentItemIds.includes(id));

    if (itemsChanged || hasMissingItems || items.length === 0) {
      // Build items in the correct order
      const orderedItems = initialOrder
        .filter(id => expectedItemIds.includes(id))
        .map(id => expectedItems.find(item => item.id === id)!)
        .filter(Boolean);

      // If current items exist and all expected items are present, preserve current order
      if (items.length > 0 && expectedItemIds.every(id => currentItemIds.includes(id))) {
        // Preserve user's reordering - only add missing items at the end
        const missingIds = expectedItemIds.filter(id => !currentItemIds.includes(id));
        const preservedItems = [...items];

        // Add missing items
        missingIds.forEach(id => {
          const opt = expectedItems.find(e => e.id === id);
          if (opt) {
            preservedItems.push(opt);
          }
        });

        // Remove items that are no longer in availableOptions
        const filteredItems = preservedItems.filter(item => expectedItemIds.includes(item.id));
        setItems(filteredItems);
        onChange(filteredItems.slice(0, maxItems).map(item => item.id));
      } else {
        // Initial load or major changes - use ordered items
        // eslint-disable-next-line no-console
        console.debug("[RankList] Initializing or resetting items:", {
          currentOrder: currentItemIds,
          expectedOrder: expectedItemIds,
          initialOrder,
        });

        setItems(orderedItems);
        // Only treat the first `maxItems` as the ranked/top goals
        onChange(orderedItems.slice(0, maxItems).map(item => item.id));
      }
    }
  }, [availableOptions.map(opt => opt.value).join(","), maxItems, value?.join(",")]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onChange(newItems.slice(0, maxItems).map(item => item.id));
        return newItems;
      });
    }
  }
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
