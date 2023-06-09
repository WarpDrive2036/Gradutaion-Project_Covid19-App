import {gql} from '@apollo/client';
import {ApiCall} from './asyncApiCall';
export const FETCH_USERS = gql`
  query {
    User {
      user_id
    }
  }
`;

export const CREATE_NEW_USER = gql`
  mutation new_user($user_id: uuid!) {
    insert_User_one(object: {user_id: $user_id, covid_status: false}) {
      user_id
    }
  }
`;

export const CHECK_USER_EXIST = `
  query check_user_exist($user_id: uuid!) {
    User_aggregate(where: {user_id: {_eq: $user_id}}) {
      aggregate {
        count
      }
    }
  }
`;
export const GET_LAST_COVID_TEST = gql`
  query get_lastest_user_test($user: uuid!) {
    CovidTest(
      limit: 1
      where: {user_id: {_eq: $user}}
      order_by: {test_time: desc}
    ) {
      test_id
      test_time
    }
  }
`;

export const COVID_TEST = gql`
  mutation new_test($user: uuid!) {
    insert_CovidTest_one(object: {user_id: $user, test_status: true}) {
      test_id
    }
  }
`;

export const CHECK_CONTACT_EXIST = `
  query check_contact_exist($primary_user: uuid!, $secondary_user: uuid!) {
    Contact_aggregate(
      where: {
        _or: [
          {
            primary_user: {_eq: $primary_user}
            secondary_user: {_eq: $secondary_user}
          }
          {
            primary_user: {_eq: $secondary_user}
            secondary_user: {_eq: $primary_user}
          }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const CREATE_NEW_USER_WITH_DEVICE = gql`
  mutation new_user(
    $user_id: uuid!
    $device_id: String!
    $first_name: String!
    $last_name: String!
    $school_id: Int
  ) {
    insert_User_one(
      object: {
        user_id: $user_id
        covid_status: false
        first_name: $first_name
        last_name: $last_name
        school_id: $school_id
        Devices: {data: {device_id: $device_id}}
      }
    ) {
      user_id
    }
  }
`;

export const ADD_NEW_CONTACT = gql`
  mutation add_new_contact(
    $primary_user: uuid!
    $secondary_user: uuid!
    $time: timestamp!
  ) {
    insert_Contact_one(
      object: {
        primary_user: $primary_user
        secondary_user: $secondary_user
        contact_time: $time
      }
    ) {
      contact_id
    }
  }
`;

export const UPDATE_LAST_SEEN = gql`
  mutation change_last_contact(
    $primary_user: uuid!
    $secondary_user: uuid!
    $time: timestamp!
  ) {
    update_Contact(
      where: {
        _or: [
          {
            primary_user: {_eq: $primary_user}
            secondary_user: {_eq: $secondary_user}
          }
          {
            primary_user: {_eq: $secondary_user}
            secondary_user: {_eq: $primary_user}
          }
        ]
      }
      _set: {contact_time: $time}
    ) {
      affected_rows
    }
  }
`;

export const check_user_exist = async (user_id: string): Promise<boolean> => {
  try {
    const res: {data: {User_aggregate: {aggregate: {count: number}}}} =
      await ApiCall('check_user_exist', CHECK_USER_EXIST, {user_id});
    return Boolean(res.data.User_aggregate.aggregate.count);
  } catch (err) {}
  return false;
};
export const check_contact_made = async (
  primary_user: string,
  secondary_user: string,
): Promise<boolean> => {
  try {
    type Result = {data: {Contact_aggregate: {aggregate: {count: number}}}};
    const data = {
      primary_user,
      secondary_user,
    };
    const response: Result = await ApiCall(
      'check_contact_exist',
      CHECK_CONTACT_EXIST,
      data,
    );
    return Boolean(response.data.Contact_aggregate.aggregate.count);
  } catch (err) {
    console.error(err);
    return false;
  }
};
