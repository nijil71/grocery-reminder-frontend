import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const EditItemDialog = ({ item, isOpen, setIsOpen, onEdit }) => {
  const [editedName, setEditedName] = useState(item?.name || '');
  const [editedShelfLife, setEditedShelfLife] = useState(
    item ? Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(item.id, editedName, editedShelfLife);
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Item</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Item name"
              className="w-full"
              required
            />
            <Input
              type="number"
              value={editedShelfLife}
              onChange={(e) => setEditedShelfLife(e.target.value)}
              placeholder="Shelf life (days)"
              className="w-full"
              required
            />
          </div>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditItemDialog;