'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/app/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/app/components/ui/select';
import { Input } from '@/components/ui/input';
import { useOrganizationList } from '@clerk/nextjs';
import type { OrganizationMembershipResource } from '@clerk/types';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/app/lib/stateContext';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';

// Define the StoredDocument type locally
interface StoredDocument {
	document_name: string;
	organization_id: string;
	document_type: string;
	last_updated: string;
}

export default function StoredDocumentsPage() {
	const [docs, setDocs] = useState<StoredDocument[]>([]);
	const [filteredDocs, setFilteredDocs] = useState<StoredDocument[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedOrg, setSelectedOrg] = useState('all');

	const { userMemberships, isLoaded } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});
	const { addNotification } = useNotifications();

	const orgMap = useMemo(() => {
		if (!isLoaded || !userMemberships.data) return {};
		const map: Record<string, string> = {
			company_knowledge: 'Company Knowledge',
		};
		userMemberships.data.forEach((mem: OrganizationMembershipResource) => {
			map[mem.organization.id] = mem.organization.name;
		});
		return map;
	}, [userMemberships.data, isLoaded]);

	const getOrgName = useCallback(
		(orgId: string) => {
			return orgMap[orgId] || orgId;
		},
		[orgMap],
	);

	useEffect(() => {
		const fetchDocs = async () => {
			setLoading(true);
			try {
				const response = await fetch('/api/admin/documents');
				if (!response.ok) {
					throw new Error('Failed to fetch documents');
				}
				const data = await response.json();
				setDocs(data.documents || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An unknown error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchDocs();
	}, []);

	useEffect(() => {
		let newFilteredDocs = docs;
		if (selectedOrg !== 'all') {
			newFilteredDocs = newFilteredDocs.filter((doc) => doc.organization_id === selectedOrg);
		}
		if (searchTerm) {
			newFilteredDocs = newFilteredDocs.filter((doc) =>
				doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}
		setFilteredDocs(newFilteredDocs);
	}, [docs, searchTerm, selectedOrg]);

	const handleDelete = async (documentName: string, organizationId: string) => {
		try {
			const response = await fetch('/api/admin/documents', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					document_name: documentName,
					organization_id: organizationId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete document');
			}

			setDocs((prevDocs) =>
				prevDocs.filter(
					(doc) => !(doc.document_name === documentName && doc.organization_id === organizationId),
				),
			);

			addNotification({
				message: 'Document deleted successfully',
				type: 'success',
			});
		} catch (error) {
			addNotification({
				message: error instanceof Error ? error.message : 'An error occurred',
				type: 'error',
			});
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Stored Documents</CardTitle>
					<CardDescription>View and manage all documents across all organizations.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex space-x-4 mb-4">
						<Input
							placeholder="Filter by name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="max-w-sm"
						/>
						<Select onValueChange={setSelectedOrg} defaultValue="all">
							<SelectTrigger className="w-[280px]">
								<SelectValue placeholder="Filter by organization" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Organizations</SelectItem>
								<SelectItem value="company_knowledge">Company Knowledge</SelectItem>
								{isLoaded &&
									userMemberships.data &&
									userMemberships.data.map((mem: OrganizationMembershipResource) => (
										<SelectItem key={mem.organization.id} value={mem.organization.id}>
											{mem.organization.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>
					{loading && <p>Loading documents...</p>}
					{error && <p className="text-red-500">{error}</p>}
					{!loading && !error && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Document Name</TableHead>
									<TableHead>Organization</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredDocs.map((doc) => (
									<TableRow key={`${doc.organization_id}-${doc.document_name}`}>
										<TableCell className="font-medium">{doc.document_name}</TableCell>
										<TableCell>{getOrgName(doc.organization_id)}</TableCell>
										<TableCell>
											{doc.last_updated
												? formatDistanceToNow(new Date(doc.last_updated), {
														addSuffix: true,
													})
												: 'N/A'}
										</TableCell>
										<TableCell className="text-right">
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="ghost" size="icon">
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Are you sure?</AlertDialogTitle>
														<AlertDialogDescription>
															This will permanently delete the document &quot;
															{doc.document_name}
															&quot; and all its associated data. This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(doc.document_name, doc.organization_id)}
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
