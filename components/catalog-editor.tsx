"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateCatalog } from "@/app/actions/catalog";
import { BreadCategory } from "@/lib/constants/bread-categories";
import {
  Plus,
  Trash2,
  Save,
  X,
  Edit2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CatalogEditorProps {
  initialCatalog: BreadCategory[];
  catalogRevision: number;
}

export default function CatalogEditor({
  initialCatalog,
  catalogRevision,
}: CatalogEditorProps) {
  const [catalog, setCatalog] = useState<BreadCategory[]>(initialCatalog);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { toast } = useToast();

  // Track if there are unsaved changes
  const hasChanges = JSON.stringify(catalog) !== JSON.stringify(initialCatalog);

  const addCategory = () => {
    const maxId = catalog.reduce((max, cat) => {
      const categoryMaxId = cat.breads.reduce(
        (catMax, bread) => Math.max(catMax, bread.id),
        0
      );
      return Math.max(max, categoryMaxId);
    }, 0);

    const newCategory: BreadCategory = {
      title: "קטגוריה חדשה",
      price: 0,
      breads: [{ id: maxId + 1, name: "מוצר חדש" }],
    };

    setCatalog([newCategory, ...catalog]); // Add at beginning
  };

  const removeCategory = (index: number) => {
    setCatalog(catalog.filter((_, i) => i !== index));
  };

  const updateCategory = (
    index: number,
    field: keyof BreadCategory,
    value: any
  ) => {
    const newCatalog = [...catalog];
    newCatalog[index] = { ...newCatalog[index], [field]: value };
    setCatalog(newCatalog);
  };

  const addBread = (categoryIndex: number) => {
    const maxId = catalog.reduce((max, cat) => {
      const categoryMaxId = cat.breads.reduce(
        (catMax, bread) => Math.max(catMax, bread.id),
        0
      );
      return Math.max(max, categoryMaxId);
    }, 0);

    const newCatalog = [...catalog];
    newCatalog[categoryIndex].breads.unshift({
      // Add at beginning
      id: maxId + 1,
      name: "מוצר חדש",
    });
    setCatalog(newCatalog);
  };

  const removeBread = (categoryIndex: number, breadIndex: number) => {
    const newCatalog = [...catalog];
    newCatalog[categoryIndex].breads = newCatalog[categoryIndex].breads.filter(
      (_, i) => i !== breadIndex
    );
    setCatalog(newCatalog);
  };

  const updateBread = (
    categoryIndex: number,
    breadIndex: number,
    name: string
  ) => {
    const newCatalog = [...catalog];
    newCatalog[categoryIndex].breads[breadIndex].name = name;
    setCatalog(newCatalog);
  };

  const moveCategoryUp = (index: number) => {
    if (index === 0) return;
    const newCatalog = [...catalog];
    [newCatalog[index - 1], newCatalog[index]] = [
      newCatalog[index],
      newCatalog[index - 1],
    ];
    setCatalog(newCatalog);
  };

  const moveCategoryDown = (index: number) => {
    if (index === catalog.length - 1) return;
    const newCatalog = [...catalog];
    [newCatalog[index], newCatalog[index + 1]] = [
      newCatalog[index + 1],
      newCatalog[index],
    ];
    setCatalog(newCatalog);
  };

  const moveBreadUp = (categoryIndex: number, breadIndex: number) => {
    if (breadIndex === 0) return;
    const newCatalog = [...catalog];
    const breads = newCatalog[categoryIndex].breads;
    [breads[breadIndex - 1], breads[breadIndex]] = [
      breads[breadIndex],
      breads[breadIndex - 1],
    ];
    setCatalog(newCatalog);
  };

  const moveBreadDown = (categoryIndex: number, breadIndex: number) => {
    const newCatalog = [...catalog];
    const breads = newCatalog[categoryIndex].breads;
    if (breadIndex === breads.length - 1) return;
    [breads[breadIndex], breads[breadIndex + 1]] = [
      breads[breadIndex + 1],
      breads[breadIndex],
    ];
    setCatalog(newCatalog);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result = await updateCatalog(catalog);

      if (result.success) {
        toast({
          title: "✅ נשמר בהצלחה",
          description: "הקטלוג עודכן בהצלחה",
        });
        setIsEditing(false);
        // Reload the page to refresh the catalog everywhere
        window.location.reload();
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "שגיאה בשמירת הקטלוג",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving catalog:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הקטלוג",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowResetDialog(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    setCatalog(initialCatalog);
    setIsEditing(false);
    setShowResetDialog(false);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm" dir="rtl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                עריכת קטלוג מוצרים
              </CardTitle>
              <CardDescription>
                עריכת קטגוריות, מחירים ומוצרי הלחם • גרסה {catalogRevision}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Edit2 className="ml-2 h-4 w-4" />
                  ערוך קטלוג
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {isSaving ? "שומר..." : "שמור שינויים"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="border-amber-300 text-amber-900 hover:bg-amber-50"
                  >
                    <X className="ml-2 h-4 w-4" />
                    ביטול
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              {catalog.map((category, index) => (
                <Card
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-amber-900">
                        {category.title}
                      </CardTitle>
                      <Badge className="bg-amber-600 text-white">
                        ₪{category.price}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {category.breads.map((bread) => (
                        <li key={bread.id} className="text-sm text-amber-800">
                          • {bread.name}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {/* Add Category Button at Top */}
              <div className="flex justify-end">
                <Button
                  onClick={addCategory}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  size="lg"
                >
                  <Plus className="ml-2 h-5 w-5" />
                  הוסף קטגוריה חדשה
                </Button>
              </div>

              {catalog.map((category, categoryIndex) => (
                <Card
                  key={categoryIndex}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label className="text-amber-900">שם הקטגוריה</Label>
                          <Input
                            value={category.title}
                            onChange={(e) =>
                              updateCategory(
                                categoryIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="לדוגמה: לחם חיטה מלאה"
                            className="mt-1 border-amber-300 focus:border-amber-500"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label className="text-amber-900">מחיר (₪)</Label>
                          <Input
                            type="number"
                            value={category.price}
                            onChange={(e) =>
                              updateCategory(
                                categoryIndex,
                                "price",
                                Number(e.target.value)
                              )
                            }
                            placeholder="24"
                            className="mt-1 border-amber-300 focus:border-amber-500"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveCategoryUp(categoryIndex)}
                          disabled={categoryIndex === 0}
                          className="border-amber-300 hover:bg-amber-100 text-amber-700"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveCategoryDown(categoryIndex)}
                          disabled={categoryIndex === catalog.length - 1}
                          className="border-amber-300 hover:bg-amber-100 text-amber-700"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCategory(categoryIndex)}
                          disabled={catalog.length === 1}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-amber-900">
                          מוצרים בקטגוריה
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addBread(categoryIndex)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                        >
                          <Plus className="ml-2 h-4 w-4" />
                          הוסף מוצר
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {category.breads.map((bread, breadIndex) => (
                          <div
                            key={bread.id}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={bread.name}
                              onChange={(e) =>
                                updateBread(
                                  categoryIndex,
                                  breadIndex,
                                  e.target.value
                                )
                              }
                              placeholder="שם המוצר"
                              className="flex-1 border-amber-300 focus:border-amber-500"
                              dir="rtl"
                            />
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  moveBreadUp(categoryIndex, breadIndex)
                                }
                                disabled={breadIndex === 0}
                                className="border-amber-300 hover:bg-amber-100"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  moveBreadDown(categoryIndex, breadIndex)
                                }
                                disabled={
                                  breadIndex === category.breads.length - 1
                                }
                                className="border-amber-300 hover:bg-amber-100"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeBread(categoryIndex, breadIndex)
                                }
                                disabled={category.breads.length === 1}
                                className="hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300"
          dir="rtl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-900 text-xl">
              ביטול שינויים?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-amber-800">
              יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לבטל את השינויים?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-amber-300 text-amber-900 hover:bg-amber-100">
              המשך עריכה
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              כן, בטל שינויים
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}
