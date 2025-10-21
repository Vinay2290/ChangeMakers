import { ID, Query } from 'appwrite';
import { appwriteConfig, databases } from './appwrite';
import { Project, Member, ProjectDonation, Donation, Task, Brainstorm } from '../lib/models';

export const projectService = {
    // Create a new project
    async createProject(
        creatorId: string,
        creatorName: string,
        title: string,
        description: string,
        location: string,
        longitude: number,
        latitude: number,
        category: string[] = [],
        project_image?: string,
        volunteerRequired: boolean = true,
        fundingRequired: boolean = false,
    ) {
        try {
            const now = new Date().toISOString();
            const projectId = ID.unique();

            console.log('Creating project with coordinates:', { longitude, latitude });

            const newProject = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                projectId,
                {
                    projectId: projectId,
                    title,
                    description,
                    location,
                    longitude: Number(longitude),
                    latitude: Number(latitude),
                    category,
                    project_image,
                    memberCount: 0,
                    progress: 0,
                    totalDonation: 0,
                    volunteerRequired,
                    completed: false,
                    fundingRequired,
                    creatorId,
                    creatorName,
                    createdAt: now,
                    endedAt: null
                }
            );

            // Add creator as first member
            await this.addProjectMember(projectId, creatorId, creatorName, title, 'owner');

            return newProject;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    // Get a project by ID
    async getProject(projectId: string) {
        try {
            const project = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                projectId
            );

            return project;
        } catch (error) {
            console.error('Error fetching project:', error);
            throw error;
        }
    },

    // Get projects with pagination and filters
    async getProjects(limit = 10, offset = 0, filters?: {
        creatorId?: string;
        category?: string;
        volunteerRequired?: boolean;
        fundingRequired?: boolean;
        completed?: boolean;
    }) {
        try {
            let queries = [
                Query.orderDesc('createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (filters?.creatorId) {
                queries.push(Query.equal('creatorId', filters.creatorId));
            }

            if (filters?.category) {
                queries.push(Query.search('category', filters.category));
            }

            if (filters?.volunteerRequired !== undefined) {
                queries.push(Query.equal('volunteerRequired', filters.volunteerRequired));
            }

            if (filters?.fundingRequired !== undefined) {
                queries.push(Query.equal('fundingRequired', filters.fundingRequired));
            }

            if (filters?.completed !== undefined) {
                queries.push(Query.equal('completed', filters.completed));
            }

            const projects = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                queries
            );

            return projects;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    // Update a project
    async updateProject(projectId: string, data: Partial<Project>) {
        try {
            const updatedProject = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                projectId,
                data
            );

            return updatedProject;
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    // Mark project as complete
    async completeProject(projectId: string, endDate: Date = new Date()) {
        try {
            const updatedProject = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                projectId,
                {
                    completed: true,
                    endedAt: endDate.toISOString()
                }
            );

            return updatedProject;
        } catch (error) {
            console.error('Error completing project:', error);
            throw error;
        }
    },

    // Delete a project
    async deleteProject(projectId: string) {
        try {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectCollectionId,
                projectId
            );

            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    // Create a project funding
    async createProjectFunding(
        projectId: string,
        fundingGoal: number,
        aim: string
    ) {
        try {
            const now = new Date().toISOString();
            const projectDonationId = ID.unique();

            const projectFunding = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectDonationCollectionId,
                projectDonationId,
                {
                    projectDonationId: projectDonationId,
                    projectId,
                    fundingGoal,
                    status: true, // active funding
                    startedAt: now,
                    endedAt: null,
                    aim,
                    fundingRaised: 0
                }
            );

            return projectFunding;
        } catch (error) {
            console.error('Error creating project funding:', error);
            throw error;
        }
    },

    // Complete a project funding
    async completeProjectFunding(projectDonationId: string) {
        try {
            const now = new Date().toISOString();

            const completedFunding = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.projectDonationCollectionId,
                projectDonationId,
                {
                    status: false, // completed
                    endedAt: now
                }
            );

            return completedFunding;
        } catch (error) {
            console.error('Error completing project funding:', error);
            throw error;
        }
    },

    // Get active project fundings
    async getProjectFundings(projectId: string) {
        try {
            const fundings = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.projectDonationCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.orderDesc('startedAt')
                ]
            );

            return fundings;
        } catch (error) {
            console.error('Error fetching project fundings:', error);
            throw error;
        }
    },

    // Add a donation to a project funding
    async addDonation(
        userId: string,
        projectId: string,
        projectTitle: string,
        projectDonationId: string,
        amount: number
    ) {
        try {
            const now = new Date().toISOString();
            const donorId = ID.unique();

            // Create donation record
            const donation = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.donorsCollectionId,
                donorId,
                {
                    donorId: donorId,
                    userId,
                    projectId,
                    projectTitle,
                    projectDonationId,
                    amount,
                    donatedAt: now
                }
            );

            // Update funding raised amount
            const funding = await databases.getDocument(
                appwriteConfig.databaseId,
                'projectDonations',
                projectDonationId
            );

            await databases.updateDocument(
                appwriteConfig.databaseId,
                'projectDonations',
                projectDonationId,
                {
                    fundingRaised: (funding.fundingRaised || 0) + amount
                }
            );

            // Update project total donation
            const project = await this.getProject(projectId);
            await this.updateProject(projectId, {
                totalDonation: (project.totalDonation || 0) + amount
            });

            return donation;
        } catch (error) {
            console.error('Error adding donation:', error);
            throw error;
        }
    },

    // Get donations for a project funding
    async getDonations(projectDonationId: string) {
        try {
            const donations = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.donorsCollectionId,
                [
                    Query.equal('projectDonationId', projectDonationId),
                    Query.orderDesc('donatedAt')
                ]
            );

            return donations;
        } catch (error) {
            console.error('Error fetching donations:', error);
            throw error;
        }
    },

    // Get donations by user
    async getUserDonations(userId: string) {
        try {
            const donations = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.donorsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('donatedAt')
                ]
            );

            return donations;
        } catch (error) {
            console.error('Error fetching user donations:', error);
            throw error;
        }
    },

    // Add a member to a project
    async addProjectMember(
        projectId: string,
        userId: string,
        userName: string,
        projectTitle: string,
        role = 'member'
    ) {
        try {
            const now = new Date().toISOString();

            // Check if already a member
            const existingMembers = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.memberCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.equal('userId', userId),
                    Query.equal('currentMember', true)
                ]
            );

            if (existingMembers.documents.length > 0) {
                return { success: false, message: 'Already a member' };
            }

            // Add member
            const memberId = ID.unique();
            const newMember = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.memberCollectionId,
                memberId,
                {
                    memberId: memberId,
                    projectId,
                    userId,
                    role,
                    currentMember: true,
                    joinedAt: now,
                    leftAt: null,
                    tasksCompleted: 0,
                    hoursContributed: 0,
                    projectTitle
                }
            );

            // Update member count
            const project = await this.getProject(projectId);
            await this.updateProject(projectId, {
                memberCount: (project.memberCount || 0) + 1
            });

            return newMember;
        } catch (error) {
            console.error('Error adding project member:', error);
            throw error;
        }
    },

    // Member leaves project
    async memberLeaveProject(memberId: string, projectId: string) {
        try {
            const now = new Date().toISOString();

            const updatedMember = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.memberCollectionId,
                memberId,
                {
                    currentMember: false,
                    leftAt: now
                }
            );

            // Update member count
            const project = await this.getProject(projectId);
            await this.updateProject(projectId, {
                memberCount: Math.max(0, (project.memberCount || 0) - 1)
            });

            return updatedMember;
        } catch (error) {
            console.error('Error processing member leaving:', error);
            throw error;
        }
    },

    // Get project members
    async getProjectMembers(projectId: string, currentOnly = true) {
        try {
            let queries = [Query.equal('projectId', projectId)];

            if (currentOnly) {
                queries.push(Query.equal('currentMember', true));
            }

            const members = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.memberCollectionId,
                queries
            );

            return members;
        } catch (error) {
            console.error('Error fetching project members:', error);
            throw error;
        }
    },

    // Add project endorsement
    async addProjectEndorsement(projectId: string, userId: string, message: string) {
        try {
            const now = new Date().toISOString();

            // Create endorsement record
            const endorsement = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.endorsementCollectionId,
                ID.unique(),
                {
                    projectId,
                    userId,
                    message,
                    createdAt: now
                }
            );

            return endorsement;
        } catch (error) {
            console.error('Error adding project endorsement:', error);
            throw error;
        }
    },

    // Get project endorsements
    async getProjectEndorsements(projectId: string) {
        try {
            const endorsements = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.endorsementCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.orderDesc('createdAt')
                ]
            );

            return endorsements;
        } catch (error) {
            console.error('Error fetching project endorsements:', error);
            throw error;
        }
    },

    // Add project task
    async addProjectTask(projectId: string, title: string, description: string, assignedTo?: string, dueDate?: Date) {
        try {
            const now = new Date().toISOString();

            // Create task record
            const task = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.taskCollectionId,
                ID.unique(),
                {
                    projectId,
                    title,
                    description,
                    status: 'pending',
                    assignedTo,
                    dueDate: dueDate ? dueDate.toISOString() : null,
                    createdAt: now,
                    updatedAt: now
                }
            );

            return task;
        } catch (error) {
            console.error('Error adding project task:', error);
            throw error;
        }
    },

    // Update task status
    async updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'completed') {
        try {
            const now = new Date().toISOString();

            const updatedTask = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.taskCollectionId,
                taskId,
                {
                    status,
                    updatedAt: now
                }
            );

            // If task is completed, update project progress
            if (status === 'completed') {
                const task = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.taskCollectionId,
                    taskId
                );

                const projectTasks = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.taskCollectionId,
                    [Query.equal('projectId', task.projectId)]
                );

                const completedTasks = projectTasks.documents.filter(t => t.status === 'completed').length;
                const totalTasks = projectTasks.documents.length;

                const progress = Math.round((completedTasks / totalTasks) * 100);

                await this.updateProject(task.projectId, { progress });
            }

            return updatedTask;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    },

    // Get project tasks
    async getProjectTasks(projectId: string) {
        try {
            const tasks = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.taskCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.orderDesc('createdAt')
                ]
            );

            return tasks;
        } catch (error) {
            console.error('Error fetching project tasks:', error);
            throw error;
        }
    },

    // Add brainstorm item
    async addBrainstormItem(projectId: string, userId: string, content: string) {
        try {
            const now = new Date().toISOString();

            // Create brainstorm record
            const brainstorm = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.brainstormCollectionId,
                ID.unique(),
                {
                    projectId,
                    userId,
                    content,
                    likes: 0,
                    createdAt: now
                }
            );

            return brainstorm;
        } catch (error) {
            console.error('Error adding brainstorm item:', error);
            throw error;
        }
    },

    // Get project brainstorm items
    async getProjectBrainstormItems(projectId: string) {
        try {
            const items = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.brainstormCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.orderDesc('createdAt')
                ]
            );

            return items;
        } catch (error) {
            console.error('Error fetching project brainstorm items:', error);
            throw error;
        }
    },

    // Add achievement
    async addAchievement(projectId: string, title: string, description: string) {
        try {
            const achievementId = ID.unique();
            const achievement = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.achievementsCollectionId,
                achievementId,
                {
                    projectId,
                    title,
                    description,
                    achievementId
                }
            );
            return achievement;
        } catch (error) {
            console.error('Error adding achievement:', error);
            throw error;
        }
    },

    // Get project achievements
    async getProjectAchievements(projectId: string) {
        try {
            const achievements = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.achievementsCollectionId,
                [
                    Query.equal('projectId', projectId),
                    Query.orderDesc('$createdAt')
                ]
            );
            return achievements;
        } catch (error) {
            console.error('Error fetching project achievements:', error);
            throw error;
        }
    }
}; 