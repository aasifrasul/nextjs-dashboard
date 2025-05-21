'use client';

import { HomeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
	{ name: 'Home', href: '/home', icon: HomeIcon },
	{
		name: 'BattleShip',
		href: '/home/battleShip',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Auto Complete',
		href: '/home/autoComplete',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Library',
		href: '/home/Library',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Image Gallery',
		href: '/home/imageGallery',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Stop Watch',
		href: '/home/stopWatch',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Tic Tac Toe',
		href: '/home/tictactoe',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Performance Hooks',
		href: '/home/performanceHooks',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Counter',
		href: '/home/counter',
		icon: DocumentDuplicateIcon,
	},
	{
		name: 'Conditional Sorting',
		href: '/home/conditionalSorting',
		icon: DocumentDuplicateIcon,
	},
];

export default function NavLinks() {
	const pathname = usePathname();

	return (
		<>
			{links.map((link) => {
				const LinkIcon = link.icon;
				return (
					<Link
						key={link.name}
						href={link.href}
						className={clsx(
							'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
							{
								'bg-sky-100 text-blue-600': pathname === link.href,
							},
						)}
					>
						<LinkIcon className="w-6" />
						<p className="hidden md:block">{link.name}</p>
					</Link>
				);
			})}
		</>
	);
}
