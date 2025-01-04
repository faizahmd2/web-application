import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, List, ListOrdered, Heading1, Heading2,
  Quote, Link as LinkIcon, Undo, Redo, Code,
  AlignLeft, AlignCenter, AlignRight, Palette,
  Square,
  LucideIcon
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MenuButtonProps {
    onClick: () => void;
    active: boolean;
    icon: LucideIcon;
    tooltip: string;
}

interface ColorButtonProps {
    onClick: () => void;
    color: {
        name: string;
        value: string;
    };
}

const EditorToolbar: React.FC<any> = ({ editor }) => {
  const textColors = [
    { name: 'Default', value: '#000000' },
    { name: 'Gray', value: '#666666' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#008000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Purple', value: '#800080' },
  ];

  const bgColors = [
    { name: 'Yellow', value: '#FFEB3B' },
    { name: 'Lime', value: '#CDDC39' },
    { name: 'Cyan', value: '#00BCD4' },
    { name: 'Pink', value: '#FF80AB' },
    { name: 'Gray', value: '#E0E0E0' },
  ];

  const MenuButton: React.FC<MenuButtonProps> = ({ onClick, active, icon: Icon, tooltip }) => (
    <Button
      variant="ghost"
      size="sm"
      className={`p-2 ${active ? 'bg-slate-200' : ''} hover:bg-slate-100`}
      onClick={onClick}
      title={tooltip}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const ColorButton: React.FC<ColorButtonProps> = ({ color, onClick }) => (
    <button
      className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform"
      style={{ backgroundColor: color.value }}
      onClick={onClick}
      title={color.name}
    />
  );

  return (
    <div className="sticky top-0 z-10 bg-white border-b pb-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={Bold}
            tooltip="Bold"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={Italic}
            tooltip="Italic"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            icon={Code}
            tooltip="Code"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={List}
            tooltip="Bullet List"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={ListOrdered}
            tooltip="Numbered List"
          />
        </div>

        {/* Headings and Quote */}
        <div className="flex gap-1 border-r pr-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            tooltip="Heading 1"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            tooltip="Heading 2"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            icon={Quote}
            tooltip="Quote"
          />
        </div>

        {/* Colors */}
        <div className="flex gap-1 border-r pr-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium mb-2">Text Color</h3>
                  <div className="grid grid-cols-6 gap-1">
                    {textColors.map((color) => (
                      <ColorButton
                        key={color.value}
                        color={color}
                        onClick={() => editor.chain().focus().setColor(color.value).run()}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Highlight Color</h3>
                  <div className="grid grid-cols-6 gap-1">
                    {bgColors.map((color) => (
                      <ColorButton
                        key={color.value}
                        color={color}
                        onClick={() => editor.chain().focus().setHighlight({ color: color.value }).run()}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-1">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            icon={AlignLeft}
            tooltip="Align Left"
          />
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            icon={AlignCenter}
            tooltip="Align Center"
          />
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            icon={AlignRight}
            tooltip="Align Right"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            tooltip="Undo"
            active={false}
          />
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            tooltip="Redo"
            active={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;