import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Админ API-аас жагсаалт татна. 401 ирвэл нэвтрэх хуудас руу шилжүүлнэ.
 * @param url  жишээ нь '/api/admin/articles'
 * @param key  хариуны JSON доторх массивын түлхүүр, жишээ нь 'articles'
 */
export function useAdminList<T>(url: string, key: string) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch(url);
      setLoading(false);
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const json = await res.json();
      setItems(json[key] ?? []);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key]);

  return { items, setItems, loading };
}
