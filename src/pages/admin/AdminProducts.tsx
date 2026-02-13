import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sparkles,
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Shield,
  Star,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: string;
  is_manual_entry: boolean;
  manual_override_active: boolean;
  auto_update_enabled: boolean;
  is_first_party: boolean;
  is_preferred: boolean;
  created_at: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, category, status, is_manual_entry, manual_override_active, auto_update_enabled, is_first_party, is_preferred, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading products', description: error.message, variant: 'destructive' });
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Product deleted' });
    }
  };

  const toggleAutoUpdate = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ auto_update_enabled: !current, updated_by: user?.id })
      .eq('id', id);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, auto_update_enabled: !current } : p))
      );
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              Product Admin
            </span>
          </div>
          <Button onClick={() => navigate('/admin/products/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {products.filter((p) => p.is_manual_entry).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Manual Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-crown-gold" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {products.filter((p) => p.is_preferred).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Preferred</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {products.filter((p) => p.is_first_party).length}
                  </p>
                  <p className="text-sm text-muted-foreground">First-Party</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Product Catalog</CardTitle>
            <CardDescription>Manage products, ingredients, and retail listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, brand, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No products match your search' : 'No products yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Add your first product to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/admin/products/new')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Auto-Update</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            {product.brand && (
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {product.category || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === 'active'
                                ? 'default'
                                : product.status === 'draft'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {product.is_manual_entry && (
                              <Badge variant="outline" className="text-xs">Manual</Badge>
                            )}
                            {product.is_preferred && (
                              <Badge variant="outline" className="text-xs border-primary/40 text-primary">Preferred</Badge>
                            )}
                            {product.is_first_party && (
                              <Badge variant="outline" className="text-xs border-secondary/40 text-secondary">1st Party</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleAutoUpdate(product.id, product.auto_update_enabled)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={product.auto_update_enabled ? 'Disable auto-update' : 'Enable auto-update'}
                          >
                            {product.auto_update_enabled ? (
                              <ToggleRight className="h-5 w-5 text-secondary" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/products/${product.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
