export interface BreadItem {
  id: number;
  name: string;
}

export interface BreadCategory {
  title: string;
  price: number;
  breads: BreadItem[];
}

export const BREAD_CATEGORIES: BreadCategory[] = [
  {
    title: "לחם חיטה מלאה",
    price: 24,
    breads: [
      { id: 1, name: "בציפוי צ'יה" },
      { id: 2, name: "בציפוי שומשום" },
      { id: 3, name: "עם עגבניות מיובשות" },
      { id: 4, name: "עם זיתים" },
    ],
  },
  {
    title: "לחם זרעים",
    price: 28,
    breads: [
      { id: 5, name: "עם שומשום" },
      { id: 6, name: "עם גרעיני דלעת" },
      { id: 7, name: "עם צ'יה" },
      { id: 8, name: "עם פשתן" },
      { id: 9, name: "עם פרג" },
    ],
  },
  {
    title: "לחם כוסמין",
    price: 28,
    breads: [
      { id: 10, name: "בציפוי שומשום" },
      { id: 11, name: "בציפוי צ'יה" },
      { id: 12, name: "עם פרג ואגוזים" },
    ],
  },
  {
    title: "לחם ארבעה קמחים",
    price: 28,
    breads: [
      { id: 13, name: "בציפוי שומשום" },
      { id: 14, name: "בציפוי זרעים" },
    ],
  },
];
