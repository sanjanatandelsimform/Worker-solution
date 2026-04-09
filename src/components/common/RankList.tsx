import { useState, useEffect, useMemo, useRef } from "react";
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

  // Build expected items from availableOptions
  const expectedItems = useMemo(
    () =>
      availableOptions.map(opt => ({
        id: opt.value,
        label: opt.label,
      })),
    [availableOptions]
  );

  const expectedItemIds = useMemo(() => expectedItems.map(item => item.id), [expectedItems]);

  // Compute initial order based on value prop
  const initialOrder = useMemo(() => {
    if (value && value.length > 0 && Array.isArray(value)) {
      const rankedIds = value.slice(0, maxItems);
      const unrankedIds = expectedItemIds.filter(id => !rankedIds.includes(id));
      return [...rankedIds, ...unrankedIds];
    }
    return expectedItemIds;
  }, [value, maxItems, expectedItemIds]);

  // Track previous values to determine if update is needed
  const prevExpectedItemIdsRef = useRef<string>("");
  const prevValueRef = useRef<string>("");
  const itemsRef = useRef(items);

  // Sync items when availableOptions or value changes
  useEffect(() => {
    // Update ref at the start of effect (not during render)
    itemsRef.current = items;

    const currentExpectedIds = expectedItemIds.join(",");
    const currentValueKey = value?.join(",") || "";
    const prevExpectedIds = prevExpectedItemIdsRef.current;
    const prevValueKey = prevValueRef.current;
    const currentItems = itemsRef.current;

    // Skip if nothing has changed
    if (
      currentExpectedIds === prevExpectedIds &&
      currentValueKey === prevValueKey &&
      currentItems.length > 0
    ) {
      return;
    }

    const currentItemIds = currentItems.map(item => item.id);

    // Build items in the correct order
    const orderedItems = initialOrder
      .filter(id => expectedItemIds.includes(id))
      .map(id => expectedItems.find(item => item.id === id)!)
      .filter(Boolean);

    let newItems: Array<{ id: string; label: string }>;

    // If current items exist and all expected items are present, preserve current order
    if (currentItems.length > 0 && expectedItemIds.every(id => currentItemIds.includes(id))) {
      // Preserve user's reordering - only add missing items at the end
      const missingIds = expectedItemIds.filter(id => !currentItemIds.includes(id));
      const preservedItems = [...currentItems];

      // Add missing items
      missingIds.forEach(id => {
        const opt = expectedItems.find(e => e.id === id);
        if (opt) {
          preservedItems.push(opt);
        }
      });

      // Remove items that are no longer in availableOptions
      newItems = preservedItems.filter(item => expectedItemIds.includes(item.id));
    } else {
      // Initial load or major changes - use ordered items
      console.debug("[RankList] Initializing or resetting items:", {
        currentOrder: currentItemIds,
        expectedOrder: expectedItemIds,
        initialOrder,
      });
      newItems = orderedItems;
    }

    // Only update if items actually changed
    const itemsChanged = JSON.stringify(newItems.map(i => i.id)) !== JSON.stringify(currentItemIds);

    if (itemsChanged) {
      // Use setTimeout to defer state update and avoid synchronous setState warning
      const timeoutId = setTimeout(() => {
        setItems(newItems);
        onChange(newItems.slice(0, maxItems).map(item => item.id));
      }, 0);

      prevExpectedItemIdsRef.current = currentExpectedIds;
      prevValueRef.current = currentValueKey;

      return () => clearTimeout(timeoutId);
    }

    prevExpectedItemIdsRef.current = currentExpectedIds;
    prevValueRef.current = currentValueKey;
  }, [
    availableOptions,
    expectedItems,
    expectedItemIds,
    initialOrder,
    items,
    maxItems,
    onChange,
    value,
  ]);

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
        {/* Drag hint */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>[You can drag and drop to reorder your selections.]</span>
        </div>
        <div className="rounded-lg border border-ws-border-primary bg-gray-50 px-4 py-6 text-center">
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
      {/* Drag hint */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <span>[ You can drag and drop to reorder your selections.]</span>
      </div>
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
