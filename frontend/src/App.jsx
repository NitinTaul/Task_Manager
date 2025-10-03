import  { useEffect, useState } from "react";
import {
  Box, Button, Input, Textarea, Heading, Flex, Text, Checkbox, Stack, Alert, AlertIcon, CloseButton, Image
} from "@chakra-ui/react";
import axios from "axios";
import Logo from "../src/assets/Logo.png"; 

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_TASKS = `${API_BASE_URL}/tasks`;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", priority: "Low" });
  const [alertMessage, setAlertMessage] = useState(null);

  const showMessage = (title, status) => setAlertMessage({ title, status });

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "red.400";
      case "Medium": return "orange.400";
      case "Low": return "green.400";
      default: return "gray.500";
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_TASKS);
      setTasks(res.data);
    } catch (error) {
      showMessage("Could not connect to backend API", error);
    }
  };

  const addTask = async () => {
    if (!form.title.trim()) {
      showMessage("Title cannot be empty.", "warning");
      return;
    }
    try {
      await axios.post(API_TASKS, form);
      setForm({ title: "", description: "", priority: "Low" });
      fetchTasks();
      showMessage("Task created successfully.", "success");
    } catch {
      showMessage("Failed to create task.", "error");
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      await axios.put(`${API_TASKS}/${id}`, { completed: !completed });
      fetchTasks();
    } catch {
      showMessage("Failed to update task.", "error");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_TASKS}/${id}`);
      fetchTasks();
      showMessage("Task deleted successfully.", "info");
    } catch {
      showMessage("Failed to delete task.", "error");
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const sortedTasks = tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Box>
      {alertMessage && (
        <Alert status={alertMessage.status} position="fixed" top="0" left="0" right="0" zIndex="10" shadow="xl">
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="medium">{alertMessage.title}</Text>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setAlertMessage(null)} />
        </Alert>
      )}

      <Flex p={6} gap={8} bg="blue.50" minH="100vh" wrap={{ base: "wrap", lg: "nowrap" }}>

        {/* Left Panel */}
        <Box w={{ base: "100%", lg: "40%" }} bg="white" p={8} rounded="2xl" shadow="2xl">
          <Flex align="center" mb={8} gap={3}>
            {/* <Image src={Logo} alt="logo" boxSize="160px" /> */}
            <Heading size="lg" color="gray.800">Task King</Heading>
          </Flex>

          <Heading size="md" mb={4} color="gray.700">Add New Task</Heading>

          <Input
            placeholder="Task Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            mb={4}
            size="lg"
            rounded="lg"
            focusBorderColor="green.400"
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            mb={4}
            size="lg"
            rounded="lg"
            focusBorderColor="green.400"
          />

          <Heading size="sm" mb={3} color="gray.600">Priority</Heading>
          <Flex gap={3} mb={6}>
            {["High", "Medium", "Low"].map((level) => (
              <Button
                key={level}
                flex="1"
                colorScheme={level === "High" ? "red" : level === "Medium" ? "orange" : "green"}
                variant={form.priority === level ? "solid" : "outline"}
                onClick={() => setForm({ ...form, priority: level })}
              >
                {level}
              </Button>
            ))}
          </Flex>

          <Button colorScheme="green" onClick={addTask} size="lg" w="full" rounded="lg" shadow="lg">
            Create Task
          </Button>
        </Box>

        {/* Right Panel */}
        <Box flex={1} w={{ base: "100%", lg: "60%" }} bg="gray.800" color="white" p={8} rounded="2xl" shadow="2xl">
          <Heading size="lg" mb={6} borderBottom="2px solid" borderColor="green.400" pb={2}>
            Task List ({tasks.filter(t => !t.completed).length} Pending)
          </Heading>

          {tasks.length === 0 && (
            <Text fontSize="xl" color="gray.400" textAlign="center" mt={10}>No tasks found. Start adding one!</Text>
          )}

          <Stack spacing={4}>
            {sortedTasks.map(task => (
              <Box
                key={task._id}
                bg="gray.700"
                p={5}
                rounded="xl"
                shadow="md"
                borderLeft="5px solid"
                borderColor={getPriorityColor(task.priority)}
                opacity={task.completed ? 0.6 : 1}
                _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
              >
                <Flex justify="space-between" align="flex-start" wrap="wrap" mb={2}>
                  <Box maxW="70%">
                    <Text fontSize="xl" fontWeight="bold" textDecoration={task.completed ? "line-through" : "none"}>
                      {task.title}
                    </Text>
                    <Text fontSize="sm" color="gray.400">Priority:
                      <Text as="span" color={getPriorityColor(task.priority)} ml={1} fontWeight="semibold">
                        {task.priority}
                      </Text>
                    </Text>
                  </Box>
                  <Flex gap={3} align="center" mt={{ base: 3, sm: 0 }}>
                    <Checkbox
                      isChecked={task.completed}
                      onChange={() => toggleTask(task._id, task.completed)}
                      colorScheme="green"
                      size="lg"
                    >
                      {task.completed ? "Done" : "Mark as done"}
                    </Checkbox>
                    <Button size="sm" colorScheme="red" onClick={() => deleteTask(task._id)} variant="ghost">
                      Delete
                    </Button>
                  </Flex>
                </Flex>
                <Text fontSize="md" color="gray.300">Description: {task.description}</Text>
              </Box>
            ))}
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
}
