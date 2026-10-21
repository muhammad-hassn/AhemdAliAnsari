"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOutAction } from "@/server/actions/auth";
import {
  updateProfileAction,
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/server/actions/account";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatOrderStatus } from "@/lib/format";
import { ALLOWED_COUNTRIES } from "@/lib/validation/checkout";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Profile, Address, Order } from "@/types";

interface AccountTabsProps {
  email: string;
  profile: Profile | null;
  addresses: Address[];
  orders: Order[];
}

export function AccountTabs({
  email,
  profile,
  addresses,
  orders,
}: AccountTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "addresses" | "wishlist"
  >("profile");

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  // Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addrName, setAddrName] = useState(profile?.full_name ?? "");
  const [addrPhone, setAddrPhone] = useState(profile?.phone ?? "");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrCountry, setAddrCountry] = useState<string>("PK");
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  // Wishlist state from store
  const wishlistedProducts = useWishlistStore((state) => state.items);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);

    const res = await updateProfileAction({ full_name: fullName, phone });
    setProfileSaving(false);
    if (res.ok) {
      setProfileStatus("Profile updated successfully.");
      router.refresh();
    } else {
      setProfileStatus(res.error || "Failed to update profile.");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrError(null);

    const res = await addAddressAction({
      label: addressLabel,
      full_name: addrName,
      phone: addrPhone,
      line1: addrLine1,
      line2: addrLine2 || undefined,
      city: addrCity,
      state: addrState,
      postal_code: addrPostal,
      country_code: addrCountry,
    });

    setAddrSaving(false);
    if (res.ok) {
      setIsAddingAddress(false);
      setAddrLine1("");
      setAddrLine2("");
      setAddrCity("");
      setAddrState("");
      setAddrPostal("");
      router.refresh();
    } else {
      setAddrError(res.error || "Failed to add address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddressAction(id);
    router.refresh();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddressAction(id);
    router.refresh();
  };

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-stone-light/60 pb-6 md:pb-0 md:pr-6 space-y-2">
        <div className="pb-4 mb-4 border-b border-stone-light/60">
          <p className="font-serif text-lg text-ink font-normal">
            {profile?.full_name || "Valued Patron"}
          </p>
          <p className="text-xs text-stone truncate">{email}</p>
          {profile?.role && profile.role !== "customer" && (
            <Badge variant="default" className="mt-2 text-[10px] uppercase">
              {profile.role}
            </Badge>
          )}
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors ${
              activeTab === "profile"
                ? "bg-stone-light/50 font-medium text-ink"
                : "text-stone hover:text-ink hover:bg-stone-light/20"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors ${
              activeTab === "orders"
                ? "bg-stone-light/50 font-medium text-ink"
                : "text-stone hover:text-ink hover:bg-stone-light/20"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors ${
              activeTab === "addresses"
                ? "bg-stone-light/50 font-medium text-ink"
                : "text-stone hover:text-ink hover:bg-stone-light/20"
            }`}
          >
            Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors ${
              activeTab === "wishlist"
                ? "bg-stone-light/50 font-medium text-ink"
                : "text-stone hover:text-ink hover:bg-stone-light/20"
            }`}
          >
            Wishlist ({wishlistedProducts.length})
          </button>
        </nav>

        <div className="pt-6 mt-6 border-t border-stone-light/60">
          <button
            onClick={handleSignOut}
            className="text-xs uppercase tracking-wider text-red-700 hover:text-red-900 transition-colors px-4 py-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-ink">Personal Profile</h2>
              <p className="text-xs uppercase tracking-widest text-stone mt-1">
                Manage your bespoke details and contact numbers
              </p>
            </div>

            {profileStatus && (
              <div className="p-4 bg-stone-light/30 border border-stone-light text-sm text-ink">
                {profileStatus}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-stone-light/20 cursor-not-allowed opacity-80"
                />
                <span className="text-[11px] text-stone">
                  Email cannot be modified directly.
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full"
                />
              </div>

              <Button type="submit" disabled={profileSaving} className="mt-4">
                {profileSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-ink">Order History</h2>
              <p className="text-xs uppercase tracking-widest text-stone mt-1">
                Track your ateliers and dispatched couture
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-stone-light">
                <p className="font-serif text-lg text-ink mb-2">No Orders Placed Yet</p>
                <p className="text-xs text-stone mb-6">
                  When you acquire an embroidered ensemble, it will appear here.
                </p>
                <Link href="/shop">
                  <Button variant="outline">Explore Collection</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 bg-cream border border-stone-light/60 space-y-4"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-stone-light/40 pb-4">
                      <div>
                        <span className="text-xs text-stone uppercase tracking-wider block">
                          Order Number
                        </span>
                        <span className="font-serif text-lg font-medium text-ink">
                          #{order.order_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone uppercase tracking-wider block">
                          Date Placed
                        </span>
                        <span className="text-xs text-ink">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone uppercase tracking-wider block">
                          Total
                        </span>
                        <span className="text-sm font-medium text-ink">
                          Rs. {order.total_pkr.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone uppercase tracking-wider block">
                          Status
                        </span>
                        <Badge variant="default" className="text-xs mt-0.5">
                          {formatOrderStatus(order.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(order.items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-xs text-ink"
                        >
                          <span>
                            {item.product_name} ({item.size}) × {item.quantity}
                          </span>
                          <span className="font-medium">
                            Rs. {(item.unit_price_pkr * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/order/${order.order_number}?t=${order.access_token}`}
                      >
                        <Button variant="outline" size="sm">
                          View Details & Tracking
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl text-ink">Saved Addresses</h2>
                <p className="text-xs uppercase tracking-widest text-stone mt-1">
                  Manage shipping destinations for swift bespoke checkout
                </p>
              </div>
              {!isAddingAddress && (
                <Button
                  size="sm"
                  onClick={() => setIsAddingAddress(true)}
                >
                  Add New Address
                </Button>
              )}
            </div>

            {isAddingAddress && (
              <div className="p-6 bg-cream border border-stone-light/60 space-y-4">
                <h3 className="font-serif text-lg text-ink">Add New Shipping Address</h3>

                {addrError && (
                  <div className="p-3 bg-red-50 text-red-800 text-xs border border-red-200">
                    {addrError}
                  </div>
                )}

                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        Label (e.g. Home, Studio)
                      </label>
                      <Input
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        Recipient Full Name
                      </label>
                      <Input
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        Contact Phone
                      </label>
                      <Input
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        Country
                      </label>
                      <select
                        value={addrCountry}
                        onChange={(e) => setAddrCountry(e.target.value)}
                        className="w-full h-10 px-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden"
                      >
                        {ALLOWED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                      Street Address
                    </label>
                    <Input
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      required
                      placeholder="Apartment, suite, street name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                      Apartment / Suite (Optional)
                    </label>
                    <Input
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        City
                      </label>
                      <Input
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        State / Province
                      </label>
                      <Input
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                        Postal Code
                      </label>
                      <Input
                        value={addrPostal}
                        onChange={(e) => setAddrPostal(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingAddress(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addrSaving}>
                      {addrSaving ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {addresses.length === 0 && !isAddingAddress ? (
              <div className="p-8 text-center border border-dashed border-stone-light">
                <p className="text-xs text-stone">No saved addresses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-cream border border-stone-light/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-serif text-base text-ink font-medium">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <Badge variant="default" className="text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-ink font-medium">{addr.full_name}</p>
                      <p className="text-xs text-stone mt-1">{addr.line1}</p>
                      {addr.line2 && <p className="text-xs text-stone">{addr.line2}</p>}
                      <p className="text-xs text-stone">
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                      <p className="text-xs text-stone">{addr.country_code}</p>
                      <p className="text-xs text-stone mt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-stone-light/40">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[11px] uppercase tracking-wider text-stone hover:text-ink transition-colors underline"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-[11px] uppercase tracking-wider text-red-700 hover:text-red-900 transition-colors ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-ink">Curated Wishlist</h2>
              <p className="text-xs uppercase tracking-widest text-stone mt-1">
                Pieces you are reserving for your upcoming celebrations
              </p>
            </div>

            {wishlistedProducts.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-stone-light">
                <p className="font-serif text-lg text-ink mb-2">Your Wishlist is Empty</p>
                <p className="text-xs text-stone mb-6">
                  Save pieces while exploring our latest collection.
                </p>
                <Link href="/shop">
                  <Button variant="outline">Discover Couture</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {wishlistedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
