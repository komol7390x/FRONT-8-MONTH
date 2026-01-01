import { useState } from "react";
import { Input, Button, Avatar, Dropdown, Tag, Select, Space } from "antd";
import { useGetList } from "./service/useGetList";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined } from "@ant-design/icons";
import { ArrowUpDown } from "lucide-react";
import { TextDashboard } from "../components/text-dashboard";

export const ListAdmin = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("username");

  const { data, isPending } = useGetList({
    limit: 10,
    page,
    search,
    sort: sort as any
  });

  const handleDelete = (id: number) => {
    console.log("Delete:", id);
  };

  const handleEdit = (id: number) => {
    console.log("Edit:", id);
  };

  const getDropdownItems = (adminId: number) => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => handleEdit(adminId)
    },
    {
      key: 'delete',
      label: <span className="text-red-500">Delete</span>,
      icon: <DeleteOutlined className="text-red-500" />,
      onClick: () => handleDelete(adminId)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <TextDashboard text="Admin List" />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-black hover:bg-gray-900 border-none font-semibold"
        >
          Add Admin
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white/95 rounded-lg p-2">
        <Input
          placeholder="Search by username, phone or role"
          prefix={<SearchOutlined className="text-gray-400" />}
          size="large"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none shadow-none"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Sort Options */}
      <div className="bg-gray-100 rounded-lg p-4">
        <Space size="large" className="text-sm">
          <span className="text-gray-700 font-medium">Sort by:</span>

          <button
            onClick={() => setSort(sort === "username" ? "-username" : "username")}
            className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors"
          >
            Username
            <ArrowUpDown size={14} />
          </button>

          <button
            onClick={() => setSort(sort === "createdAt" ? "-createdAt" : "createdAt")}
            className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors"
          >
            Created Date
            <ArrowUpDown size={14} />
          </button>

          <button
            onClick={() => setSort(sort === "updatedAt" ? "-updatedAt" : "updatedAt")}
            className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors"
          >
            Updated Date
            <ArrowUpDown size={14} />
          </button>
        </Space>
      </div>

      {/* Admin List */}
      <div className="space-y-3">
        {isPending ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          data?.admins?.map((admin: any) => (
            <div
              key={admin.id}
              className="bg-white rounded-xl p-5 flex items-center justify-between hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <Avatar
                  size={56}
                  src={admin.avatarUrl && admin.avatarUrl.trim() !== "" ? admin.avatarUrl : null}
                  className="bg-gray-600 text-white font-bold text-xl shrink-0"
                >
                  {admin.username?.charAt(0).toUpperCase()}
                </Avatar>

                <div className="flex flex-col">
                  <div className="flex items-center gap-20">
                    <span className="text-gray-900 font-semibold text-lg">
                      {admin.username}
                    </span>
                    <Tag
                      color={admin.role === "SUPER_ADMIN" ? "red" : "blue"}
                      className="font-semibold uppercase px-3 py-0.5"
                    >
                      {admin.role === "SUPER_ADMIN" ? "SUPERADMIN" : "ADMIN"}
                    </Tag>
                  </div>

                  {admin.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <PhoneOutlined />
                      <span>{admin.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Actions */}
              <div className="flex items-center gap-2">
                <Dropdown
                  menu={{ items: getDropdownItems(admin.id) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="default"
                    className="h-10 px-6 font-bold border-gray-300 rounded-lg text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all"
                  >
                    More
                  </Button>
                </Dropdown>

                <Button
                  type="default" 
                  onClick={() => handleEdit(admin.id)}
                  className="h-10 px-6 font-bold border-gray-300 rounded-lg text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all"
                >
                  Edit
                </Button>

                <Button
                  type="primary"
                  danger
                  onClick={() => handleDelete(admin.id)}
                  className="font-medium"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-4">
        <div>
          Showing <span className="font-semibold">{(page - 1) * 10 + 1}</span> to{" "}
          <span className="font-semibold">
            {Math.min(page * 10, data?.total || 0)}
          </span>{" "}
          of <span className="font-semibold">{data?.total || 0}</span> results
        </div>

        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select
            defaultValue={10}
            className="w-32"
            options={[
              { value: 10, label: "10 per page" },
              { value: 20, label: "20 per page" },
              { value: 50, label: "50 per page" },
              { value: 100, label: "100 per page" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};