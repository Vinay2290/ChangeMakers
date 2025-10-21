import { ID, Query } from 'appwrite';
import { appwriteConfig, databases } from './appwrite';
import { Task, Brainstorm } from './models';
import { userService } from './user-service';

export const taskService = {
    // Create a new task
    async createTask(
        projectId: string,
        subject: string,
        description: string,
        assignedBy: string,
        assignedTo: string[] = [],
        deadline?: Date
    ) {
        try {
            const now = new Date().toISOString();

            const task = await databases.createDocument(
                appwriteConfig.databaseId,
                'tasks',
                ID.unique(),
                {
                    taskId: ID.unique(),
                    projectId,
                    subject,
                    description,
                    status: false, // Not completed
                    assignedAt: now,
                    deadline: deadline ? deadline.toISOString() : null,
                    completedAt: null,
                    assignedBy,
                    assignedTo
                }
            );

            // Notify assigned users
            if (assignedTo && assignedTo.length > 0) {
                const notifyPromises = assignedTo.map(userId =>
                    userService.createNotification(
                        userId,
                        `You've been assigned a new task: ${subject}`,
                        'task',
                        [task.$id, projectId]
                    )
                );

                await Promise.all(notifyPromises);
            }

            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Complete a task
    async completeTask(taskId: string, userId: string, projectId: string) {
        try {
            const now = new Date().toISOString();

            // Update task
            const task = await databases.updateDocument(
                appwriteConfig.databaseId,
                'tasks',
                taskId,
                {
                    status: true,
                    completedAt: now
                }
            );

            // Increment tasks completed count for the member
            const members = await databases.listDocuments(
                appwriteConfig.databaseId,
                'members',
                [
                    Query.equal('projectId', projectId),
                    Query.equal('userId', userId),
                    Query.equal('currentMember', true)
                ]
            );

            if (members.documents.length > 0) {
                const member = members.documents[0];
                await databases.updateDocument(
                    appwriteConfig.databaseId,
                    'members',
                    member.$id,
                    {
                        tasksCompleted: (member.tasksCompleted || 0) + 1
                    }
                );
            }

            // Notify task creator
            if (task.assignedBy !== userId) {
                await userService.createNotification(
                    task.assignedBy,
                    `Task "${task.subject}" has been completed`,
                    'task_completed',
                    [taskId, projectId]
                );
            }

            // Update project progress
            await updateProjectProgress(projectId);

            return task;
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    },

    // Get project tasks
    async getProjectTasks(projectId: string, status?: boolean) {
        try {
            let queries = [Query.equal('projectId', projectId)];

            if (status !== undefined) {
                queries.push(Query.equal('status', status));
            }

            // Order by deadline for pending tasks or by completedAt for completed tasks
            if (status === false) {
                queries.push(Query.orderAsc('deadline'));
            } else if (status === true) {
                queries.push(Query.orderDesc('completedAt'));
            }

            const tasks = await databases.listDocuments(
                appwriteConfig.databaseId,
                'tasks',
                queries
            );

            return tasks;
        } catch (error) {
            console.error('Error fetching project tasks:', error);
            throw error;
        }
    },

    // Get tasks assigned to a user
    async getUserTasks(userId: string, status?: boolean) {
        try {
            let queries = [Query.search('assignedTo', userId)];

            if (status !== undefined) {
                queries.push(Query.equal('status', status));
            }

            // Order by deadline for pending tasks or by completedAt for completed tasks
            if (status === false) {
                queries.push(Query.orderAsc('deadline'));
            } else if (status === true) {
                queries.push(Query.orderDesc('completedAt'));
            }

            const tasks = await databases.listDocuments(
                appwriteConfig.databaseId,
                'tasks',
                queries
            );

            return tasks;
        } catch (error) {
            console.error('Error fetching user tasks:', error);
            throw error;
        }
    },

    // Add a brainstorm idea
    async addBrainstormIdea(projectId: string, authorId: string, content: string) {
        try {
            const now = new Date().toISOString();

            const idea = await databases.createDocument(
                appwriteConfig.databaseId,
                'brainstorm',
                ID.unique(),
                {
                    brainstormId: ID.unique(),
                    projectId,
                    authorId,
                    content,
                    submittedAt: now,
                    upvotes: 0
                }
            );

            return idea;
        } catch (error) {
            console.error('Error adding brainstorm idea:', error);
            throw error;
        }
    },

    // Upvote a brainstorm idea
    async upvoteBrainstormIdea(brainstormId: string) {
        try {
            // Get current idea
            const idea = await databases.getDocument(
                appwriteConfig.databaseId,
                'brainstorm',
                brainstormId
            );

            // Increment upvotes
            const updatedIdea = await databases.updateDocument(
                appwriteConfig.databaseId,
                'brainstorm',
                brainstormId,
                {
                    upvotes: (idea.upvotes || 0) + 1
                }
            );

            return updatedIdea;
        } catch (error) {
            console.error('Error upvoting brainstorm idea:', error);
            throw error;
        }
    },

    // Get project brainstorm ideas
    async getProjectBrainstormIdeas(projectId: string, sortByUpvotes = false) {
        try {
            let queries = [Query.equal('projectId', projectId)];

            if (sortByUpvotes) {
                queries.push(Query.orderDesc('upvotes'));
            } else {
                queries.push(Query.orderDesc('submittedAt'));
            }

            const ideas = await databases.listDocuments(
                appwriteConfig.databaseId,
                'brainstorm',
                queries
            );

            return ideas;
        } catch (error) {
            console.error('Error fetching brainstorm ideas:', error);
            throw error;
        }
    }
};

// Helper function to update project progress based on completed tasks
async function updateProjectProgress(projectId: string) {
    try {
        // Get all tasks for the project
        const allTasks = await databases.listDocuments(
            appwriteConfig.databaseId,
            'tasks',
            [Query.equal('projectId', projectId)]
        );

        if (allTasks.documents.length === 0) {
            return; // No tasks, no progress to update
        }

        // Calculate progress percentage
        const totalTasks = allTasks.documents.length;
        const completedTasks = allTasks.documents.filter(task => task.status === true).length;
        const progress = Math.round((completedTasks / totalTasks) * 100);

        // Update project progress
        await databases.updateDocument(
            appwriteConfig.databaseId,
            'projects',
            projectId,
            { progress }
        );

        return { success: true, progress };
    } catch (error) {
        console.error('Error updating project progress:', error);
        throw error;
    }
} 