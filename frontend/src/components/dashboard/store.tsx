'use client'

import React, { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { Avatar, Background, EmotePack, ItemType } from '@/types/Store'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/context/walletContext'
import Wallet from '@/components/ui/wallet'
import Image from 'next/image'
import { useLang } from '@/context/langContext'
import en from '@/i18n/en'
import fr from '@/i18n/fr'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { cn } from '@/utils'
import { Coins } from 'lucide-react'

const Store: React.FC = () => {
	const { lang } = useLang()
	const t = lang === 'en' ? en.store : fr.store
	const { storeItems, inventory, isLoading, error, buyItem, equipItem } = useStore()
	const { budget, fetchBudget } = useWallet()
	const [activeTab, setActiveTab] = useState<string>('avatars')

	const buttonClasses = {
		base: "w-full",
		buy: "bg-foreground text-background hover:bg-primary-foreground hover:text-background",
		owned: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
		equippable: "bg-primary-foreground text-primary-background hover:bg-primary-foreground/80"
	}

	const isItemOwned = (id: number, type: ItemType) => {
		return inventory.some(item => item.item_id === id.toString() && item.item_type === type.toString())
	}

	const isItemEquipped = (id: number, type: ItemType) => {
		return inventory.some(item =>
			item.item_id === id.toString() &&
			item.item_type === type.toString() &&
			item.is_equipped
		)
	}

	const handleBuy = async (id: number, type: ItemType, price: number) => {
		if ((budget || 0) < price) {
			toast.error(t.notEnoughCoins)
			return
		}

		const success = await buyItem({
			item_id: id.toString(),
			item_type: type.toString()
		})

		if (success) {
			fetchBudget()
		}
	}

	const handleEquip = async (id: number, type: ItemType) => {
		if (type === ItemType.EMOTE_PACK) return;

		await equipItem({
			item_id: id.toString(),
			item_type: type.toString()
		})
	}

	const getButtonClasses = (owned: boolean, equipped: boolean, type: ItemType) => {
		if (equipped) return cn(buttonClasses.base, "bg-primary-foreground text-primary-background hover:bg-primary-foreground/80");
		if (!owned) return cn(buttonClasses.base, buttonClasses.buy);
		if (type === ItemType.EMOTE_PACK) return cn(buttonClasses.base, buttonClasses.owned);
		return cn(buttonClasses.base, buttonClasses.equippable);
	}

	const getButtonText = (owned: boolean, equipped: boolean, type: ItemType) => {
		if (equipped) return t.equipped || 'Equipped';
		if (owned) return type === ItemType.EMOTE_PACK ? t.owned : t.equip;
		return t.buy;
	}

	const renderItem = (
		id: number,
		type: ItemType,
		price: number,
		name: string,
		imagePath: string,
		isWide: boolean = false
	) => {
		const owned = isItemOwned(id, type);
		const equipped = isItemEquipped(id, type);

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="overflow-hidden h-full transition-all hover:shadow-md">
					<div className="relative aspect-square">
						<Image
							src={imagePath}
							alt={name}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
							className={`object-cover ${type === ItemType.AVATAR ? 'rounded-full mx-auto my-4 !h-4/5 !w-4/5 !relative' : ''}`}
						/>
						<div className="absolute top-2 right-2">
							<Badge variant="secondary" className={owned ? "bg-primary-foreground text-primary-background" : "bg-foreground text-background"}>
								{owned ? t.owned : (
									<div className="flex items-center gap-1">
										<span>{price}</span>
										<Coins className="h-3 w-3" />
									</div>
								)}
							</Badge>
						</div>
					</div>

					<CardContent className="p-4">
						<h3 className="font-medium text-lg text-center">{name}</h3>
					</CardContent>

					<CardFooter className="p-4 pt-0">
						<Button
							variant={equipped ? "default" : "secondary"}
							className={getButtonClasses(owned, equipped, type)}
							disabled={isLoading || (owned && type === ItemType.EMOTE_PACK) || equipped}
							onClick={() => owned ? handleEquip(id, type) : handleBuy(id, type, price)}
						>
							{getButtonText(owned, equipped, type)}
						</Button>
					</CardFooter>
				</Card>
			</motion.div>
		)
	}

	const renderAvatars = () => {
		if (!storeItems?.avatars?.length) return <p className="text-center py-4">{t.noAvatars}</p>

		const sortedAvatars = [...storeItems.avatars].sort((a, b) => {
			const aOwned = isItemOwned(a.id, ItemType.AVATAR) ? 1 : 0;
			const bOwned = isItemOwned(b.id, ItemType.AVATAR) ? 1 : 0;
			return bOwned - aOwned;
		});

		return (
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
				{sortedAvatars.map((avatar) => (
					<div key={avatar.id}>
						{renderItem(
							avatar.id,
							ItemType.AVATAR,
							avatar.price,
							`${t.avatars} #${avatar.id}`,
							avatar.image_path
						)}
					</div>
				))}
			</div>
		)
	}

	const renderBackgrounds = () => {
		if (!storeItems?.backgrounds?.length) return <p className="text-center py-4">{t.noBackgrounds}</p>

		const sortedBackgrounds = [...storeItems.backgrounds].sort((a, b) => {
			const aOwned = isItemOwned(a.id, ItemType.BACKGROUND) ? 1 : 0;
			const bOwned = isItemOwned(b.id, ItemType.BACKGROUND) ? 1 : 0;
			return bOwned - aOwned;
		});

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedBackgrounds.map((background) => (
					<div key={background.id}>
						{renderItem(
							background.id,
							ItemType.BACKGROUND,
							background.price,
							background.name,
							background.image_path,
							true
						)}
					</div>
				))}
			</div>
		)
	}


	if (error) {
		return (
			<div className="p-4 text-center">
				<p className="text-red-500">{error}</p>
				<Button
					onClick={() => window.location.reload()}
					className={cn(buttonClasses.base, buttonClasses.buy, "mt-2")}
				>
					{t.retry}
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-bold">{t.title}</h2>
				<Wallet budget={budget} />
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="mb-8 flex border-b justify-start overflow-x-auto">
					<TabsTrigger value="avatars" className="flex-1 max-w-[200px]">
						{t.avatars}
					</TabsTrigger>
					<TabsTrigger value="backgrounds" className="flex-1 max-w-[200px]">
						{t.backgrounds}
					</TabsTrigger>

				</TabsList>

				<TabsContent value="avatars" className="mt-4 pb-8">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
						</div>
					) : renderAvatars()}
				</TabsContent>

				<TabsContent value="backgrounds" className="mt-4 pb-8">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
						</div>
					) : renderBackgrounds()}
				</TabsContent>

			</Tabs>
		</div>
	)
}

export default Store 