"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Crop } from "lucide-react";

interface DraggableThumbnailProps {
  id: string;
  url: string;
  onRemove: (id: string) => void;
  onCrop: (id: string) => void;
  isDraggable: boolean;
}

const DraggableThumbnail = ({
  id,
  url,
  onRemove,
  onCrop,
  isDraggable,
}: DraggableThumbnailProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      className="relative touch-none group"
    >
      <img
        src={url}
        alt="thumbnail"
        className="w-20 h-20 object-cover rounded-md"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute -top-1 -right-1 bg-black/60 p-0.5 rounded-full text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remover imagem"
      >
        <X size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCrop(id);
        }}
        className="absolute bottom-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Cortar imagem"
      >
        <Crop size={14} />
      </button>
    </div>
  );
};

interface DraggableThumbnailsProps {
  items: { id: string; url: string }[];
  setItems: (items: { id: string; url: string }[]) => void;
  onRemove: (id: string) => void;
  onCrop: (id: string) => void;
}

export default function DraggableThumbnails({
  items,
  setItems,
  onRemove,
  onCrop,
}: DraggableThumbnailsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const isDraggable = items.length > 1;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="flex gap-2 flex-wrap">
          {items.map((item) => (
            <DraggableThumbnail
              key={item.id}
              id={item.id}
              url={item.url}
              onRemove={onRemove}
              onCrop={onCrop}
              isDraggable={isDraggable}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
