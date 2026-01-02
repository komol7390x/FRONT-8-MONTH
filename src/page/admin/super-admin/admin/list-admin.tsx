import { useState } from "react"
import { useGetList } from "./service/useGetList";
import { TextDashboard } from "../components/text-dashboard";
import { ButtonIcon } from "../../../../components/button";
import { Flex, Input, Space } from 'antd';

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

  return (
    <div className="bg-black/500 border">

      <div className="flex justify-between gap-5">

        <div className="pt-2">
          <TextDashboard text="Admin List" />
        </div>

        <div className="mt-3">
          <Input.Search
            placeholder="Search"
            variant="filled"
            style={{
              border: '1px solid #cfcfcf',
              borderRadius: '10px',
              width: '500px',
              display: 'flex',

            }}
          />
        </div>

        <div className="mt-3">
          <ButtonIcon text="Add Admin" bg="#18b53c" />
        </div>
      </div>

     

    </div >
  );
};