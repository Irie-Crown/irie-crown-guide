import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  Package,
  FlaskConical,
  ShoppingCart,
  Link as LinkIcon,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'Shampoo', 'Conditioner', 'Deep Conditioner', 'Leave-In',
  'Styling Cream', 'Gel', 'Oil', 'Serum', 'Mask', 'Scalp Treatment',
  'Mousse', 'Spray', 'Butter', 'Detangler', 'Other',
];

interface RetailListing {
  id?: string;
  retailer: string;
  product_url: string;
  affiliate_url: string;
  price: string;
  availability: string;
}

interface PurchasePathway {
  id?: string;
  pathway_type: string;
  retailer: string;
  url: string;
  label: string;
  is_primary: boolean;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  // Product fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [productType, setProductType] = useState('');
  const [status, setStatus] = useState('active');
  const [isFirstParty, setIsFirstParty] = useState(false);
  const [isPreferred, setIsPreferred] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  // Ingredient fields
  const [rawIngredients, setRawIngredients] = useState('');
  const [moistureProtein, setMoistureProtein] = useState('');
  const [weightRichness, setWeightRichness] = useState('');
  const [scalpFriendliness, setScalpFriendliness] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Retail listings
  const [listings, setListings] = useState<RetailListing[]>([]);

  // Purchase pathways
  const [pathways, setPathways] = useState<PurchasePathway[]>([]);

  useEffect(() => {
    if (isEditing) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setIsLoading(true);

    const [productRes, ingredientRes, listingsRes, pathwaysRes] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('product_ingredients').select('*').eq('product_id', id).maybeSingle(),
      supabase.from('retail_listings').select('*').eq('product_id', id),
      supabase.from('purchase_pathways').select('*').eq('product_id', id),
    ]);

    if (productRes.data) {
      const p = productRes.data;
      setName(p.name);
      setBrand(p.brand || '');
      setDescription(p.description || '');
      setCategory(p.category || '');
      setSubcategory(p.subcategory || '');
      setProductType(p.product_type || '');
      setStatus(p.status);
      setIsFirstParty(p.is_first_party);
      setIsPreferred(p.is_preferred);
      setAutoUpdateEnabled(p.auto_update_enabled);
    }

    if (ingredientRes.data) {
      const ing = ingredientRes.data;
      setRawIngredients(ing.raw_ingredients_text || '');
      setMoistureProtein(ing.moisture_protein_balance || '');
      setWeightRichness(ing.weight_richness || '');
      setScalpFriendliness(ing.scalp_friendliness || '');
      setAdminNotes(ing.admin_notes || '');
    }

    if (listingsRes.data) {
      setListings(
        listingsRes.data.map((l) => ({
          id: l.id,
          retailer: l.retailer,
          product_url: l.product_url || '',
          affiliate_url: l.affiliate_url || '',
          price: l.price?.toString() || '',
          availability: l.availability || 'unknown',
        }))
      );
    }

    if (pathwaysRes.data) {
      setPathways(
        pathwaysRes.data.map((pw) => ({
          id: pw.id,
          pathway_type: pw.pathway_type,
          retailer: pw.retailer || '',
          url: pw.url || '',
          label: pw.label || '',
          is_primary: pw.is_primary,
        }))
      );
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Product name is required', variant: 'destructive' });
      return;
    }
    if (!user) return;

    setIsSaving(true);

    try {
      // Save product
      const productPayload = {
        name: name.trim(),
        brand: brand.trim() || null,
        description: description.trim() || null,
        category: category || null,
        subcategory: subcategory.trim() || null,
        product_type: productType.trim() || null,
        status,
        is_manual_entry: true,
        manual_override_active: true,
        auto_update_enabled: autoUpdateEnabled,
        is_first_party: isFirstParty,
        is_preferred: isPreferred,
        updated_by: user.id,
      };

      let productId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({ ...productPayload, created_by: user.id })
          .select('id')
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Save ingredients
      if (rawIngredients.trim()) {
        const ingredientPayload = {
          product_id: productId!,
          raw_ingredients_text: rawIngredients.trim(),
          moisture_protein_balance: moistureProtein || null,
          weight_richness: weightRichness || null,
          scalp_friendliness: scalpFriendliness || null,
          admin_notes: adminNotes.trim() || null,
          is_verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        };

        if (isEditing) {
          const { data: existing } = await supabase
            .from('product_ingredients')
            .select('id')
            .eq('product_id', productId!)
            .maybeSingle();

          if (existing) {
            await supabase.from('product_ingredients').update(ingredientPayload).eq('id', existing.id);
          } else {
            await supabase.from('product_ingredients').insert(ingredientPayload);
          }
        } else {
          await supabase.from('product_ingredients').insert(ingredientPayload);
        }
      }

      // Save retail listings
      if (isEditing) {
        await supabase.from('retail_listings').delete().eq('product_id', productId!);
      }
      const validListings = listings.filter((l) => l.retailer.trim());
      if (validListings.length > 0) {
        await supabase.from('retail_listings').insert(
          validListings.map((l) => ({
            product_id: productId!,
            retailer: l.retailer.trim(),
            product_url: l.product_url.trim() || null,
            affiliate_url: l.affiliate_url.trim() || null,
            price: l.price ? parseFloat(l.price) : null,
            availability: l.availability,
          }))
        );
      }

      // Save purchase pathways
      if (isEditing) {
        await supabase.from('purchase_pathways').delete().eq('product_id', productId!);
      }
      const validPathways = pathways.filter((pw) => pw.pathway_type.trim());
      if (validPathways.length > 0) {
        await supabase.from('purchase_pathways').insert(
          validPathways.map((pw) => ({
            product_id: productId!,
            pathway_type: pw.pathway_type.trim(),
            retailer: pw.retailer.trim() || null,
            url: pw.url.trim() || null,
            label: pw.label.trim() || null,
            is_primary: pw.is_primary,
          }))
        );
      }

      toast({ title: isEditing ? 'Product updated' : 'Product created' });
      navigate('/admin/products');
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const addListing = () =>
    setListings((prev) => [
      ...prev,
      { retailer: '', product_url: '', affiliate_url: '', price: '', availability: 'unknown' },
    ]);

  const removeListing = (idx: number) =>
    setListings((prev) => prev.filter((_, i) => i !== idx));

  const updateListing = (idx: number, field: keyof RetailListing, value: string) =>
    setListings((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));

  const addPathway = () =>
    setPathways((prev) => [
      ...prev,
      { pathway_type: '', retailer: '', url: '', label: '', is_primary: false },
    ]);

  const removePathway = (idx: number) =>
    setPathways((prev) => prev.filter((_, i) => i !== idx));

  const updatePathway = (idx: number, field: keyof PurchasePathway, value: string | boolean) =>
    setPathways((prev) => prev.map((pw, i) => (i === idx ? { ...pw, [field]: value } : pw)));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {isEditing ? 'Edit Product' : 'New Product'}
            </span>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="details">
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="gap-2">
              <Package className="h-4 w-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="gap-2">
              <FlaskConical className="h-4 w-4" /> Ingredients
            </TabsTrigger>
            <TabsTrigger value="retailers" className="gap-2">
              <ShoppingCart className="h-4 w-4" /> Retailers
            </TabsTrigger>
            <TabsTrigger value="purchase" className="gap-2">
              <LinkIcon className="h-4 w-4" /> Purchase Links
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Curl Defining Cream" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. SheaMoisture" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product description..." />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input id="subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Admin Controls</CardTitle>
                  <CardDescription>Override and governance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Auto-Update Enabled</p>
                      <p className="text-sm text-muted-foreground">Allow automatic data updates from retailers</p>
                    </div>
                    <Switch checked={autoUpdateEnabled} onCheckedChange={setAutoUpdateEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">First-Party Product</p>
                      <p className="text-sm text-muted-foreground">Mark as an internal/owned product</p>
                    </div>
                    <Switch checked={isFirstParty} onCheckedChange={setIsFirstParty} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Preferred Product</p>
                      <p className="text-sm text-muted-foreground">Boost in recommendations</p>
                    </div>
                    <Switch checked={isPreferred} onCheckedChange={setIsPreferred} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Ingredient Intelligence</CardTitle>
                <CardDescription>Parse, tag, and classify product ingredients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="raw-ingredients">Raw Ingredients List</Label>
                  <Textarea
                    id="raw-ingredients"
                    value={rawIngredients}
                    onChange={(e) => setRawIngredients(e.target.value)}
                    rows={5}
                    placeholder="Paste the full ingredient list here..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Moisture / Protein Balance</Label>
                    <Select value={moistureProtein} onValueChange={setMoistureProtein}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moisture-heavy">Moisture-Heavy</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="protein-heavy">Protein-Heavy</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weight / Richness</Label>
                    <Select value={weightRichness} onValueChange={setWeightRichness}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lightweight">Lightweight</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scalp Friendliness</Label>
                    <Select value={scalpFriendliness} onValueChange={setScalpFriendliness}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gentle">Gentle</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="potentially-irritating">Potentially Irritating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes about this product's formulation, compatibility, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retailers Tab */}
          <TabsContent value="retailers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display">Retail Listings</CardTitle>
                  <CardDescription>Where this product can be purchased</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addListing} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Retailer
                </Button>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No retail listings yet. Add retailers where this product is available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{listing.retailer || 'New Listing'}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => removeListing(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Retailer Name *</Label>
                            <Input value={listing.retailer} onChange={(e) => updateListing(idx, 'retailer', e.target.value)} placeholder="e.g. Amazon, Target" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Price</Label>
                            <Input value={listing.price} onChange={(e) => updateListing(idx, 'price', e.target.value)} placeholder="12.99" type="number" step="0.01" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Product URL</Label>
                            <Input value={listing.product_url} onChange={(e) => updateListing(idx, 'product_url', e.target.value)} placeholder="https://..." />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Affiliate URL</Label>
                            <Input value={listing.affiliate_url} onChange={(e) => updateListing(idx, 'affiliate_url', e.target.value)} placeholder="https://..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Links Tab */}
          <TabsContent value="purchase">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display">Purchase Pathways</CardTitle>
                  <CardDescription>Checkout options available to users</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addPathway} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Pathway
                </Button>
              </CardHeader>
              <CardContent>
                {pathways.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No purchase pathways yet. Add checkout options for users.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pathways.map((pw, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{pw.label || 'New Pathway'}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => removePathway(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Type *</Label>
                            <Select value={pw.pathway_type} onValueChange={(v) => updatePathway(idx, 'pathway_type', v)}>
                              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="external_link">External Link</SelectItem>
                                <SelectItem value="affiliate">Affiliate Link</SelectItem>
                                <SelectItem value="embedded_checkout">Embedded Checkout</SelectItem>
                                <SelectItem value="first_party">First-Party Checkout</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input value={pw.label} onChange={(e) => updatePathway(idx, 'label', e.target.value)} placeholder="e.g. Buy on Amazon" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Retailer</Label>
                            <Input value={pw.retailer} onChange={(e) => updatePathway(idx, 'retailer', e.target.value)} placeholder="e.g. Amazon" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">URL</Label>
                            <Input value={pw.url} onChange={(e) => updatePathway(idx, 'url', e.target.value)} placeholder="https://..." />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pw.is_primary}
                            onCheckedChange={(v) => updatePathway(idx, 'is_primary', v)}
                          />
                          <Label className="text-sm">Primary purchase option</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
