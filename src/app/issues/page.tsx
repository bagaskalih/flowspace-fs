"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Task {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  description: string;
  status: 'todo' | 'progress' | 'review' | 'done';
}

export default function IssuesTracker() {
  const [selectedMenu, setSelectedMenu] = useState("Issues Tracker");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<'todo' | 'progress' | 'review' | 'done'>('todo');
  const [newTask, setNewTask] = useState({
    title: '',
    description: ''
  });

  // Sample tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Buat Entity Relationship Diagram',
      author: 'Jeremia Christian',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'todo'
    },
    {
      id: '2',
      title: 'Landing Page Design',
      author: 'Zhafit Naufal',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'todo'
    },
    {
      id: '3',
      title: 'Buat Entity Relationship Diagram',
      author: 'Jeremia Christian',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'progress'
    },
    {
      id: '4',
      title: 'Landing Page Design',
      author: 'Zhafit Naufal',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'progress'
    },
    {
      id: '5',
      title: 'Buat Entity Relationship Diagram',
      author: 'Jeremia Christian',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'review'
    },
    {
      id: '6',
      title: 'Landing Page Design',
      author: 'Zhafit Naufal',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'review'
    },
    {
      id: '7',
      title: 'Buat Entity Relationship Diagram',
      author: 'Jeremia Christian',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'done'
    },
    {
      id: '8',
      title: 'Landing Page Design',
      author: 'Zhafit Naufal',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'done'
    },
    {
      id: '9',
      title: 'Login Page Design',
      author: 'Zhafit Naufal',
      timeAgo: '1h ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'done'
    }
  ]);

  const handleAddNew = (status: 'todo' | 'progress' | 'review' | 'done') => {
    setModalStatus(status);
    setShowAddModal(true);
  };

  const handleUpload = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        author: 'Current User',
        timeAgo: 'now',
        description: newTask.description,
        status: modalStatus
      };

      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '' });
      setShowAddModal(false);
    }
  };

  const getTasksByStatus = (status: 'todo' | 'progress' | 'review' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusTitle = (status: 'todo' | 'progress' | 'review' | 'done') => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'progress': return 'In Progress';
      case 'review': return 'In Review';
      case 'done': return 'Done';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
      <CardContent className="p-4">
        <h3 className="font-medium mb-2" style={{ color: '#E4E1B6' }}>
          {task.title}
        </h3>
        <div className="text-sm mb-3" style={{ color: '#CD5B43' }}>
          {task.author}, {task.timeAgo}
        </div>
        <p className="text-sm opacity-80" style={{ color: '#E4E1B6' }}>
          {task.description}
        </p>
      </CardContent>
    </Card>
  );

  const KanbanColumn = ({ 
    status, 
    title, 
    tasks 
  }: { 
    status: 'todo' | 'progress' | 'review' | 'done', 
    title: string, 
    tasks: Task[] 
  }) => (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <h2 className="text-xl font-medium mb-1" style={{ color: '#E4E1B6' }}>
          {title}
        </h2>
        <p className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>
          {tasks.length} {tasks.length === 1 ? 'task' : tasks.length > 1 ? 'tasks' : 'items'} available
        </p>
      </div>
      
      <Button
        onClick={() => handleAddNew(status)}
        className="w-full mb-4 h-10 rounded-lg transition-colors"
        style={{ 
          backgroundColor: '#CD5B43',
          color: '#E4E1B6'
        }}
      >
        <img src="/icon-plus.png" alt="Add" className="w-4 h-4 mr-2" />
        Add new
      </Button>

      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-screen" style={{ backgroundColor: '#0C2A28' }}>
        {/* Sidebar */}
        <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Issues Tracker Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-semibold" style={{ color: '#E4E1B6' }}>
                  Issues Tracker
                </h1>
              </div>

              {/* Column Headers */}
              <div className="flex gap-6 mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-medium mb-1" style={{ color: '#E4E1B6' }}>
                    To Do
                  </h2>
                  <p className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>
                    {getTasksByStatus('todo').length} {getTasksByStatus('todo').length === 1 ? 'task' : getTasksByStatus('todo').length > 1 ? 'tasks' : 'items'} available
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-medium mb-1" style={{ color: '#E4E1B6' }}>
                    In Progress
                  </h2>
                  <p className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>
                    {getTasksByStatus('progress').length} {getTasksByStatus('progress').length === 1 ? 'task' : getTasksByStatus('progress').length > 1 ? 'tasks' : 'items'} available
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-medium mb-1" style={{ color: '#E4E1B6' }}>
                    In Review
                  </h2>
                  <p className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>
                    {getTasksByStatus('review').length} {getTasksByStatus('review').length === 1 ? 'task' : getTasksByStatus('review').length > 1 ? 'tasks' : 'items'} available
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-medium mb-1" style={{ color: '#E4E1B6' }}>
                    Done
                  </h2>
                  <p className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>
                    {getTasksByStatus('done').length} {getTasksByStatus('done').length === 1 ? 'task' : getTasksByStatus('done').length > 1 ? 'tasks' : 'items'} available
                  </p>
                </div>
              </div>

              {/* Add New Buttons */}
              <div className="flex gap-6 mb-4">
                <div className="flex-1 min-w-0">
                  <Button
                    onClick={() => handleAddNew('todo')}
                    className="w-full h-10 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: '#CD5B43',
                      color: '#E4E1B6'
                    }}
                  >
                    <img src="/icon-plus.png" alt="Add" className="w-4 h-4 mr-2" />
                    Add new
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <Button
                    onClick={() => handleAddNew('progress')}
                    className="w-full h-10 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: '#CD5B43',
                      color: '#E4E1B6'
                    }}
                  >
                    <img src="/icon-plus.png" alt="Add" className="w-4 h-4 mr-2" />
                    Add new
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <Button
                    onClick={() => handleAddNew('review')}
                    className="w-full h-10 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: '#CD5B43',
                      color: '#E4E1B6'
                    }}
                  >
                    <img src="/icon-plus.png" alt="Add" className="w-4 h-4 mr-2" />
                    Add new
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <Button
                    onClick={() => handleAddNew('done')}
                    className="w-full h-10 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: '#CD5B43',
                      color: '#E4E1B6'
                    }}
                  >
                    <img src="/icon-plus.png" alt="Add" className="w-4 h-4 mr-2" />
                    Add new
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Kanban Board */}
            <div className="flex-1 overflow-auto px-6">
              <div className="flex gap-6 h-full">
                <div className="flex-1 min-w-0">
                  <div className="space-y-4">
                    {getTasksByStatus('todo').map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="space-y-4">
                    {getTasksByStatus('progress').map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="space-y-4">
                    {getTasksByStatus('review').map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="space-y-4">
                    {getTasksByStatus('done').map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Judul
              </h3>
              
              <div className="space-y-4">
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Isi Judul"
                  className="h-12 px-4 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </Label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Deskripsikan tasks di sini"
                    className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors text-gray-800 placeholder-gray-400 resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    0/200
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={() => setShowAddModal(false)}
                    variant="outline"
                    className="flex-1 h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}